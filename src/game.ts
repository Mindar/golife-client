import {Grid} from '2dgrid';

import GameOfLife from './GameOfLife';

window.onload = init;

let game: GameOfLife;

function init(){
	fillHeader();
	const canvas = initCanvas();
	game = new GameOfLife('ws://localhost:8080', canvas);
}

function initCanvas(): HTMLCanvasElement{
	const canv = <HTMLCanvasElement | null> document.getElementById('gamecanv');
	if(!canv) {
		throw new Error('Canvas not found.');
	}

	canv.width = canv.clientWidth;
	canv.height = canv.clientHeight;
	return canv;
}

function fillHeader(){
	const elem = <HTMLSpanElement> document.getElementById('dumbcomment');
	const comments = [
		'- Game of the Year Edition',
		'- Premium Edition',
		'- Gold Edition',
		'- Special Edition',
		'- All DLCs included',
		'- now with 100% more deaths'
	];

	const index = Math.floor(Math.random() * comments.length);
	elem.innerText = comments[index];
}