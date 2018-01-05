!function(t){function r(e){if(i[e])return i[e].exports;var o=i[e]={i:e,l:!1,exports:{}};return t[e].call(o.exports,o,o.exports,r),o.l=!0,o.exports}var i={};r.m=t,r.c=i,r.d=function(t,i,e){r.o(t,i)||Object.defineProperty(t,i,{configurable:!1,enumerable:!0,get:e})},r.n=function(t){var i=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(i,"a",i),i},r.o=function(t,r){return Object.prototype.hasOwnProperty.call(t,r)},r.p="",r(r.s=0)}([function(t,r,i){"use strict";function e(){n();var t=o();a=new s.default("ws://localhost:8080",t)}function o(){var t=document.getElementById("gamecanv");if(!t)throw new Error("Canvas not found.");return t.width=t.clientWidth,t.height=t.clientHeight,t}function n(){var t=document.getElementById("dumbcomment"),r=["- Game of the Year Edition","- Premium Edition","- Gold Edition","- Special Edition","- All DLCs included","- now with 100% more deaths"],i=Math.floor(Math.random()*r.length);t.innerText=r[i]}Object.defineProperty(r,"__esModule",{value:!0});var s=i(1);window.onload=e;var a},function(t,r,i){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var e=i(2),o=function(){function t(t,r){var i=this;this.conn=new WebSocket(t),this.conn.onopen=function(t){return console.log("Connected")},this.conn.onmessage=function(t){return i.handleMsg(t)},this.conn.onclose=function(t){return i.handleDc(t)},this.conn.onerror=function(t){return console.error(t)},this.canv=r,this.h=this.canv.height,this.w=this.canv.width;var o=this.canv.getContext("2d");if(null===o)throw new Error("Could not get context from canvas.");this.ctx=o,this.grid=new e.Grid(1,1),this.grid.fill(!1),this.commands=[],this.registerCommand({id:"cmd-randomize-grid",uitext:"Randomize Grid",onclick:this.cmdRandomizeGrid.bind(this)}),this.registerCommand({id:"cmd-clear-grid",uitext:"Clear",onclick:this.cmdClearGrid.bind(this)}),this.draw()}return t.prototype.cmdClearGrid=function(){var t={};t.action="world.modify",t.changes=[];for(var r=0;r<this.grid.rows;r++)for(var i=0;i<this.grid.cols;i++){var e={};e.row=r,e.col=i,e.val=!1,t.changes.push(e)}var o=JSON.stringify(t);this.conn.send(o)},t.prototype.cmdRandomizeGrid=function(){var t={};t.action="world.modify",t.changes=[];for(var r=0;r<this.grid.rows;r++)for(var i=0;i<this.grid.cols;i++){var e=Math.random(),o=!0;e>.5&&(o=!o);var n={};n.row=r,n.col=i,n.val=o,t.changes.push(n)}var s=JSON.stringify(t);this.conn.send(s)},t.prototype.registerCommand=function(t){this.commands.push(t);var r=document.querySelector("#commands");if(null===r)throw new Error("No command list UI element found.");if(t.html)t.html.onclick=t.onclick,r.appendChild(t.html);else{var i=document.createElement("div");i.onclick=t.onclick,i.classList.add("cmd"),i.innerText=t.uitext,i.id=t.id,r.appendChild(i)}},t.prototype.draw=function(){var t=this.canv.height/this.grid.rows,r=this.canv.width/this.grid.cols,i=this.canv.width,e=this.canv.height;this.ctx.clearRect(0,0,i,e),this.ctx.fillStyle="#000";for(var o=0;o<this.grid.rows;o++)for(var n=0;n<this.grid.cols;n++)if(this.grid.valueAt(o,n)){var s=n*r,a=o*t;this.ctx.fillRect(s,a,r,t)}requestAnimationFrame(this.draw.bind(this))},t.prototype.updateGrid=function(t){this.grid=e.Grid.fromArray(t.grid.cells,t.grid.rows,t.grid.cols)},t.prototype.handleMsg=function(t){var r=JSON.parse(t.data);switch(r.action){case"world.update":this.updateGrid(r)}},t.prototype.handleDc=function(t){},t}();r.default=o},function(t,r,i){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var e=i(3);r.Grid=e.Grid},function(t,r,i){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var e=function(){function t(t,r){if(void 0==t)throw new Error("Number of rows can't be undefined.");if(void 0==r)throw new Error("Number of cols can't be undefined.");if(t<1)throw new Error("Number of rows must be >1");if(r<1)throw new Error("Number of cols must be >1");this._rows=t,this._cols=r;var i=t*r;this.cells=new Array(i)}return t.prototype.arrayPosition=function(t,r){return t*this.cols+r},t.prototype.getRow=function(t){for(var r=this.sanitizeRow(t),i=[],e=0;e<this.cols;e++){var o=this.arrayPosition(r,e);i.push(this.cells[o])}return i},t.prototype.getCol=function(t){for(var r=this.sanitizeCol(t),i=[],e=0;e<this.rows;e++){var o=this.arrayPosition(e,r);i.push(this.cells[o])}return i},t.prototype.sanitizeRow=function(t){if(!this.isRowValid(t))throw new Error("Row index must be >0 and <"+this.rows+", but was "+t+".");return t<0?t%-this.rows+this.rows:t%this.rows},t.prototype.sanitizeCol=function(t){if(!this.isColValid(t))throw new Error("Col index must be >0 and <"+this.cols+", but was "+t+".");return t<0?t%-this.cols+this.cols:t%this.cols},t.prototype.isRowValid=function(t){return!!this.wrapRows||!(t<0)&&!(t>this.rows)},t.prototype.isColValid=function(t){return!!this.wrapCols||!(t<0)&&!(t>this.cols)},t.prototype.valueAt=function(t,r){var i=this.sanitizeRow(t),e=this.sanitizeCol(r),o=this.arrayPosition(i,e);return this.cells[o]},t.prototype.valueAtOrUndefined=function(t,r){if(this.isRowValid(t)&&this.isColValid(r))return this.valueAt(t,r)},t.prototype.insert=function(t,r,i){var e=this.sanitizeRow(r),o=this.sanitizeCol(i),n=this.arrayPosition(e,o);this.cells[n]=t},t.prototype.getCols=function(){for(var t=[],r=0;r<this.cols;r++)t.push(this.getCol(r));return t},t.prototype.getRows=function(){for(var t=[],r=0;r<this.rows;r++)t.push(this.getRow(r));return t},t.prototype.fill=function(t){for(var r=0;r<this.cells.length;r++)this.cells[r]=t},t.prototype.getNeighbours=function(t,r){var i=(this.sanitizeRow(t),this.sanitizeCol(r),[]);return i.push(this.valueAtOrUndefined(t+1,r-1)),i.push(this.valueAtOrUndefined(t,r-1)),i.push(this.valueAtOrUndefined(t-1,r-1)),i.push(this.valueAtOrUndefined(t+1,r)),i.push(this.valueAtOrUndefined(t-1,r)),i.push(this.valueAtOrUndefined(t+1,r+1)),i.push(this.valueAtOrUndefined(t,r+1)),i.push(this.valueAtOrUndefined(t-1,r+1)),i.filter(function(t){return void 0!==t})},t.prototype.toArray=function(){for(var t=[],r=0,i=this.cells;r<i.length;r++){var e=i[r];t.push(e)}return t},t.fromArray=function(r,i,e){for(var o=new t(i,e),n=0;n<r.length;n++){var s=Math.round(n/i),a=n%i;o.insert(r[n],s,a)}return o},Object.defineProperty(t.prototype,"wrapRows",{get:function(){return this._wrapRows},set:function(t){this._wrapRows=t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"wrapCols",{get:function(){return this._wrapCols},set:function(t){this._wrapCols=t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"rows",{get:function(){return this._rows},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"cols",{get:function(){return this._cols},enumerable:!0,configurable:!0}),t}();r.Grid=e}]);