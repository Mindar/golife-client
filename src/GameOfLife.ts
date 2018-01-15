import { Grid } from "2dgrid";
import GridRenderer from "./GridRenderer";
import {ITool, IGridChange} from './tools/ITool';
import GliderTool from './tools/GliderTool';

export default class GameOfLife {
	private conn: WebSocket;
	private grid: Grid<boolean>;
	private commands: any[];
	private renderer: GridRenderer;
	private tool: ITool | undefined;

	constructor(url: string, canvas: HTMLCanvasElement){
		this.conn = new WebSocket(url);
		this.conn.onopen = (event) => console.log('Connected');
		this.conn.onmessage = (event) => this.handleMsg(event);
		this.conn.onclose = (event) => this.handleDc(event);
		this.conn.onerror = (event) => console.error(event);

		const grid = new Grid<boolean>(1, 1);
		grid.fill(false);
		this.grid = grid;

		canvas.onclick = this.applyTool.bind(this);
		canvas.onmousemove = this.moveTool.bind(this);

		const renderer = new GridRenderer(grid, canvas);
		this.renderer = renderer;

		this.commands = [];
		this.registerCommand({id: 'cmd-spawn-glider', uitext: 'Spawn Glider', onclick: this.cmdSpawnGlider.bind(this)});
		this.registerCommand({id: 'cmd-randomize-grid', uitext: 'Randomize Grid', onclick: this.cmdRandomizeGrid.bind(this)});
		this.registerCommand({id: 'cmd-clear-grid', uitext: 'Clear', onclick: this.cmdClearGrid.bind(this)});
		this.draw();
	}


	private applyTool(e: MouseEvent): void{
		if(this.tool === undefined) return;

		const cell = this.renderer.coordToCell(e.clientX, e.clientY);
		const changes = this.tool.apply(cell.row, cell.col, this.grid);

		this.sendChanges(changes);
		this.tool = undefined;
	}

	private moveTool(e: MouseEvent): void{
		const cell = this.renderer.coordToCell(e.clientX, e.clientY);
		console.log('MOUSE.');
		console.log(cell);
		console.log('' + e.clientX + ' ' + e.clientY);
		console.log(document.getElementById('gamecanv').clientHeight);
	}

	private sendChanges(changes: IGridChange[]): void{
		const data: any = {};
		data.cmd = 'world.modify';
		data.payload = changes;

		const msg = JSON.stringify(data);
		this.conn.send(msg);
	}

	private cmdSpawnGlider(): void {
		/**
		 * @todo: create method "setActiveTool" which - depending on the tool's requirements adds event handlers to onclick, mousemove, keyboard input, rendering handling, ...
		 */

		this.tool = new GliderTool();
		// set current tool to glider tool
	}

	private cmdClearGrid(): void {
		const msg: any = {};
		msg.cmd = 'world.clear';
		
		const msgtxt = JSON.stringify(msg);
		this.conn.send(msgtxt);
	}

	private cmdRandomizeGrid(): void{
		console.log('Randomizing');
		const aliveChance = 0.5;
		const changes: IGridChange[] = [];

		for(let row = 0; row < this.grid.rows; row++){
			for(let col = 0; col < this.grid.cols; col++){
				// Generate random value for this cell
				const aliveVal = Math.random();
				let alive = true;

				// Kill if value above threshold
				if(aliveVal > aliveChance){
					alive = !alive;
				}

				// add change to array
				const change: IGridChange = {val: alive, row, col};
				changes.push(change);
			}
		}

		this.sendChanges(changes);
	}

	private registerCommand(cmd: {id: string, uitext: string, onclick: any, html?: HTMLElement}): void{
		// adds a single command to the ui
		this.commands.push(cmd);

		const cmdList = <HTMLDivElement|null> document.querySelector('#commands');
		if(cmdList === null) throw new Error('No command list UI element found.');

		if(cmd.html) {
			cmd.html.onclick = cmd.onclick;
			cmdList.appendChild(cmd.html);
		} else {
			const cmdElem = document.createElement("div");
			cmdElem.onclick = cmd.onclick;
			cmdElem.classList.add('cmd');
			cmdElem.innerText = cmd.uitext;
			cmdElem.id = cmd.id;
			cmdList.appendChild(cmdElem);
		}
	}

	private draw(): void{
		if(this.grid !== undefined) {
			this.renderer.render();
		}

		requestAnimationFrame(this.draw.bind(this));
	}

	private updateGrid(data: any): void {
		const newgrid = Grid.fromArray<boolean>(data.grid.cells, data.grid.rows, data.grid.cols);

		this.renderer.grid = newgrid;
		this.grid = newgrid;
		
	}

	private handleMsg(event: MessageEvent){
		const msg = JSON.parse(event.data);
		switch(msg.action){
			case "world.update":
				this.updateGrid(msg);
		}
	}

	private handleDc(event: CloseEvent){

	}
}