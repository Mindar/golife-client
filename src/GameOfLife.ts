import { Grid } from "2dgrid";

export default class GameOfLife {
	private ctx: CanvasRenderingContext2D;
	private canv: HTMLCanvasElement;
	private conn: WebSocket;
	private h: number;
	private w: number;
	private grid: Grid<boolean>;
	private commands: any[];

	constructor(url: string, canvas: HTMLCanvasElement){
		this.conn = new WebSocket(url);
		this.conn.onopen = (event) => console.log('Connected');;
		this.conn.onmessage = (event) => this.handleMsg(event);
		this.conn.onclose = (event) => this.handleDc(event);
		this.conn.onerror = (event) => console.error(event);

		this.canv = canvas;
		this.h = this.canv.height;
		this.w = this.canv.width;

		const tmpctx = this.canv.getContext('2d');
		if(tmpctx === null){
			throw new Error('Could not get context from canvas.');
		}
		this.ctx = tmpctx;

		this.grid = new Grid(1,1);
		this.grid.fill(false);

		this.commands = [];

		this.registerCommand({id: 'cmd-randomize-grid', uitext: 'Randomize Grid', onclick: this.cmdRandomizeGrid.bind(this)});
		this.registerCommand({id: 'cmd-clear-grid', uitext: 'Clear', onclick: this.cmdClearGrid.bind(this)});
		this.draw();
	}

	private cmdClearGrid(): void {
		const msg: any = {};
		msg.action = 'world.modify';
		msg.changes = [];

		for(let row = 0; row < this.grid.rows; row++){
			for(let col = 0; col < this.grid.cols; col++){
				const change: any = {};
				change.row = row;
				change.col = col;
				change.val = false;

				msg.changes.push(change);
			}
		}

		const msgtxt = JSON.stringify(msg);
		this.conn.send(msgtxt);
	}

	private cmdRandomizeGrid(): void{
		const aliveChance = 0.5;
		const msg: any = {};
		msg.action = 'world.modify';
		msg.changes = [];
		
		for(let row = 0; row < this.grid.rows; row++){
			for(let col = 0; col < this.grid.cols; col++){
				const aliveVal = Math.random();
				let alive = true;

				// Kill if above threshold
				if(aliveVal > aliveChance){
					alive = !alive;
				}

				const change: any = {};
				change.row = row;
				change.col = col;
				change.val = alive;

				msg.changes.push(change);
			}
		}

		const msgtxt = JSON.stringify(msg);
		this.conn.send(msgtxt);
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

		const pxPerRow = this.canv.height / this.grid.rows;
		const pxPerCol = this.canv.width / this.grid.cols;
		const w = this.canv.width;
		const h = this.canv.height;


		this.ctx.clearRect(0, 0, w, h);
		this.ctx.fillStyle = "#000";

		for(let row = 0; row < this.grid.rows; row++){
			for(let col = 0; col < this.grid.cols; col++){
				if(!this.grid.valueAt(row, col)) continue;
				
				const xPos = col * pxPerCol;
				const yPos = row * pxPerRow;
				this.ctx.fillRect(xPos, yPos, pxPerCol, pxPerRow);
			}
		}

		requestAnimationFrame(this.draw.bind(this));
	}

	private updateGrid(data: any): void {
		this.grid = Grid.fromArray(data.grid.cells, data.grid.rows, data.grid.cols);
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