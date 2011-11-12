




$(document).ready(function(){
  $("#clear-button").click(function(){
    now.clearBoard();
  });
});  
now.updateList = function(){
      var list = "LIST:<br>";
      for (var i in now.clients) {
        list += now.clients[i].name+"<br>";
      }
      $("#list").html(list);
 }
  
  
now.currentDrawing = [];
 
var paper;
var lastPoint = "";
var image = [];
var draw = false;
var r;

now.ready(function(){
  nameTaken = true;
//checkName("name?");
  now.askName = function(string){
    now.setName(prompt(string));
  }
  now.askName("Name?");
  start();
});



function start(){
  
  width = now.GAMEWIDE*now.GAMEUNIT;
  height = now.GAMEHIGH*now.GAMEUNIT;
  paper = Raphael(200,50,width,height);
  r = paper.rect(0,0,width,height).attr("fill","white").attr("stroke", "blue");

  $(window).mousedown(function(){
     draw = true;
     //console.log(draw);
  });
  $(window).mouseup(function(){
     draw = false;
     now.eraseTemp(now.currentDrawing);
     now.currentDrawing = [];
   });

  var lp = "";  
  $(window).mousemove(function(e){
   if(draw){
     var x = Math.floor(e.offsetX/now.GAMEUNIT);
     var y = Math.floor(e.offsetY/now.GAMEUNIT);

     var cp = x+","+y;
     if (lp != cp){
       lp = cp;
var repeat = false;

jQuery.each(now.currentDrawing, function(index, value){
	//	console.log("xy = "+x+","+y);
//	console.log("CDxy = "+value[0]+","+value[1]);
	if(!repeat){
		repeat = value[0] == x && value[1] == y ? true : false;
	}
});
     //  console.log(repeat);

       if(repeat){
            console.log("closed drawing");
            now.addToBoard({name:now.name,moveArray:now.currentDrawing});
           // now.clearTemp(now.currentDrawing);
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
    paper.rect(x,y,now.GAMEUNIT,now.GAMEUNIT).attr("fill","blue");;
    
}
now.eraseTemp = function(temps){
    //console.log(temps);
   for(x in temps){
      if(jQuery.isArray(temps[x])){
  
            paper.rect((temps[x][0]*now.GAMEUNIT),(temps[x][1]*now.GAMEUNIT),now.GAMEUNIT,now.GAMEUNIT).attr("fill","white");
        
      }
    }  
}

now.lastStableBoard = [];

colors = ["red","blue","green"];


now.drawBoard = function(board){
	
	var filler;
 //   console.log(board);
  console.log("drawBoard called");
  	if(board == "clear"){
	    now.lastStableBoard = [];
	    for(i= 0;i<now.GAMEWIDE;i++){
	      now.lastStableBoard[i] = [];
	      for(var j = 0; j < now.GAMEHIGH; j++){
	        now.lastStableBoard[i][j] = -1;
	      }
	    }
	    paper.clear();
	    width = now.GAMEWIDE*now.GAMEUNIT;
	    height = now.GAMEHIGH*now.GAMEUNIT;
	    paper = Raphael(200,50,width,height);
	    r = paper.rect(0,0,width,height).attr("fill","white").attr("stroke", "blue");
	    now.drawBoard(now.stableBoard);
	}
	else
	{
		for(x in board){
			for(y in board[x]){
				filler = colors[board[x][y]];
				if(!jQuery.isArray(now.lastStableBoard[x])){
					paper.rect((x*now.GAMEUNIT),(y*now.GAMEUNIT),now.GAMEUNIT,now.GAMEUNIT).attr("fill",filler);
				}
				else
				{
					if(board[x][y] != now.lastStableBoard[x][y] ){
						paper.rect((x*now.GAMEUNIT),(y*now.GAMEUNIT),now.GAMEUNIT,now.GAMEUNIT).attr("fill",filler);
					}
				}
			}
		} 
		now.lastStableBoard = board;   
	}
	
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
