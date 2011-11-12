$(document).ready(function() {
  $("#clear-button").click(function() {
    now.clearBoard();
  });
});
now.updateList = function() {
	/*
  var list = "LIST:<br>";
  for (var i in now.clients) {
    list += now.clients[i].name+"<br>";
  }
  $("#list").html(list);
*/
}  

now.currentDrawing = [];

var paper;
var lastPoint = "";
var image = [];
var draw = false;
var r;
var started = false;
now.lastStableBoard = [];
var blankColor = "white";
var colors = ["blue","red","green", "yellow"];
// Prebuffered audio resources
var welcome = $("audio#welcome").attr("src");
var place = $("audio#place").attr("src");
var fail = $("audio#fail").attr("src");
var success = $("audio#success").attr("src");
// Play the audio file at the given url.
function play(url) {
  var sound = new Audio(url);
  sound.play();
}
now.updateButtons = function(){
	//console.log(now.statuses);
	$("#players").empty();	
	$.each(now.statuses, function(index, value){
		//values keep changing between -1, undefined and null for some reason
		value = value == undefined || value == -1 || value == null ? "X" : "O";
		var butt = $("<button class='player_"+index+"'>"+value+"</button>").click(function(){
			if(now.statuses[index] == -1||now.statuses[index]==undefined||now.statuses[index]==null){
				if(now.myP != -1){
					var foo = now.myP;
					now.setStatus(foo, -1);
				}
				now.setStatus(index, 1);
				now.myP = index;
			}	
		});	
		$("#players").append(butt);	
	});
}



now.firstStart = function(){
	 play(welcome);

	if(started){
		// console.log("tried to reconnect?????????!!!!!!!!!!"); 
		return;
	}
	else{
		started = true;
	}
	now.updateButtons();
	now.myP = -1;	
  	setUp();
}

function setBoard(){
  width = now.GAMEWIDE*now.GAMEUNIT;
  height = now.GAMEHIGH*now.GAMEUNIT;
  paper = Raphael(200,50,width,height);
  r = paper.rect(0,0,width,height).attr("fill","white").attr("stroke-width", "0");
}

function setUp(){
  setBoard();
  $(window).mousedown(function(){
     draw = true;
  });
  $(window).mouseup(function(){
     draw = false;
	now.addToBoard({pos:now.myP,moveArray:now.currentDrawing});
     //now.eraseTemp(now.currentDrawing);
     now.currentDrawing = [];
   });

  	var lp = "";  
  	$(window).mousemove(function(e){
		if(draw && now.myP >= 0){
		//if(draw){
			// console.log($(e.target).children());
			var x = Math.floor(e.offsetX/now.GAMEUNIT);
			var y = Math.floor(e.offsetY/now.GAMEUNIT);
			var good = "SVGRectElement";
			var cp = x+","+y;
			if (lp != cp){
				        play(place);

				lp = cp;
				var repeat = false;
				// console.log("x="+x+", y="+y);
				repeat = ($(e.target).children().length>0 || x>=now.GAMEWIDE || x< 0 || y>=now.GAMEHIGH || y<0) ? true : false;
				jQuery.each(now.currentDrawing, function(index, value){
					//console.log("xy = "+x+","+y);
					//console.log("CDxy = "+value[0]+","+value[1]);
					if(!repeat){
						repeat = ((value[0] == x && value[1] == y) || inStableBoard([x,y])) ? true : false;
					}
					else{
						return;
					}
				});
				//console.log(repeat);
				if(repeat){
					draw=false;
					// console.log("closed drawing");
					now.addToBoard({pos:now.myP,moveArray:now.currentDrawing});
					now.currentDrawing = [];
				}
				else{
					now.currentDrawing.push([x,y]);
					tempDraw([x,y]);
				}
			}
		}
  	});
}
tempDraw = function(array){
    var x = array[0]*now.GAMEUNIT;
    var y = array[1]*now.GAMEUNIT;
    paper.rect(x,y,now.GAMEUNIT,now.GAMEUNIT).attr("stroke-width",0).attr("fill",colors[now.myP]);
}
now.eraseTemp = function(temps){
   //console.log(temps);
   for(x in temps){
      if(jQuery.isArray(temps[x])){
            paper.rect((temps[x][0]*now.GAMEUNIT),(temps[x][1]*now.GAMEUNIT),now.GAMEUNIT,now.GAMEUNIT).attr("fill","white").attr("stroke",0);   
      }
    }  
	return;
}

function inStableBoard(coords){		
	return (now.stableBoard[coords[0]][coords[1]] != -1)
}

now.drawBoard = function(board) {
  play(fail);
  var filler;
  console.log(board);
  console.log("drawBoard called");
  for (x in board) {
    for (y in board[x]) {
      player = board[x][y];
      filler = player == -1 ? blankColor : colors[player];
      if (!$.isArray(now.lastStableBoard[x])) {
        paper.rect((x*now.GAMEUNIT),(y*now.GAMEUNIT),now.GAMEUNIT,now.GAMEUNIT).attr("stroke-width",0).attr("fill",filler);
      } else if (player != now.lastStableBoard[x][y] ) {
        paper.rect((x*now.GAMEUNIT),(y*now.GAMEUNIT),now.GAMEUNIT,now.GAMEUNIT).attr("stroke-width",0).attr("fill",filler);
      }
    }
  } 
  now.lastStableBoard = board;
}


function ArrayIndexOf(a, fnc) {
  if (!fnc || typeof (fnc) != 'function') {
    return -1;
  }
  if (!a || !a.length || a.length < 1) return -1;
  for (var i = 0; i < a.length; i++) {
    if (fnc(a[i])) return i;
  }
  return -1;
}
