var $ = require('jquery')
  , express = require('express')
  , nowjs = require("now")
  , g = require("./gost");

var app = express.createServer();

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.render('index.jade', {title: 'gost'});
});

app.listen(8080);

var everyone = nowjs.initialize(app);

everyone.now.GAMEUNIT = 20;
everyone.now.GAMEWIDE = 30;
everyone.now.GAMEHIGH = 30;

var game;
var globalStart = false;

nowjs.on("connect", function() {
   //	if(globalStart){console.log("tried to re-establish!!!!!!!!!!"); return;}else{console.log("FIRST JOIN");globalStart = true;}

 	game = new g.Game(everyone.now.GAMEWIDE, everyone.now.GAMEHIGH);


	var player0 = new g.Player('Player One', '0');
	var player1 = new g.Player('Player Two', '1');
	var player2 = new g.Player('Player Three', '2');
	var player3 = new g.Player('Player Four', '3');

	// STONES WILL ONLY BE PLACED IF THEY MAKE A CONNECTED SHAPE!
	//game.placeStones(peter, [[1,1], [1,3], [2,2], [0,2]]);
	g.printBoard(game.board)
	everyone.now.stableBoard = (game.board);
	everyone.now.players = [player0, player1, player2, player3];
	everyone.now.statuses = [-1,-1,-1,-1];
	this.now.firstStart();
});

everyone.now.setStatus = function(index,value){
	console.log("change pos "+index+" to "+value);
	everyone.now.statuses[index] = value;
	everyone.now.updateButtons();
}


everyone.now.addToBoard = function(cObj){ 
  console.log(cObj);
  var pos = cObj.pos;
  var array = cObj.moveArray;
  game.placeStones(everyone.now.players[pos], array);
  //g.printBoard(game.board);
  everyone.now.stableBoard = game.board;
	everyone.now.eraseTemp(array);
  everyone.now.drawBoard(game.board);
}

nowjs.on("connect", function() {
}); 

nowjs.on("disconnect", function() {
	if(this.now.myP >-1){
		everyone.now.setStatus(this.now.myP, "-1");
	}
 	console.log("Left: " + this.now.name);
 	//everyone.now.updateList();
});


everyone.now.clearBoard = function(){
	/*
  game = new g.Game(everyone.now.GAMEWIDE, everyone.now.GAMEHIGH);
  peter = new g.Player('Peter', '33');
  bill = new g.Player('Billy', '22');
  everyone.now.drawBoard("clear");
*/
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
