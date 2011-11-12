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
  res.redirect('/default');
});

app.get('/:room', function(req, res){
  res.render('index.jade', {title: 'gost'});
});

app.listen(8080);

var everyone = nowjs.initialize(app);

everyone.now.GAMEUNIT = 20;
everyone.now.GAMEWIDE = 30;
everyone.now.GAMEHIGH = 30;

// var globalStart = false;

nowjs.on("connect", function() {
   //	if(globalStart){console.log("tried to re-establish!!!!!!!!!!"); return;}else{console.log("FIRST JOIN");globalStart = true;}
  //	If the client's requested game room does not exist, create it.
  var group = nowjs.getGroup(this.now.group);
  console.log(this.now.group);
  console.log("hey");
  if (!group.game) {
    group.game = new g.Game(everyone.now.GAMEWIDE, everyone.now.GAMEHIGH);
    group.now.statuses = [-1,-1,-1,-1];
  }
  group.addUser(this.user.clientId);
  this.user.player = new g.Player('Name', -1); // The player starts unactivated until he updates his status.
  group.game.addPlayer(this.user.player);
	group.now.stableBoard = group.game.board;
  group.now.drawBoard(group.game.board);
  this.now.firstStart();
});

everyone.now.setStatus = function(index,value){
	// console.log("change pos "+index+" to "+value);
  this.user.player.id = index;
  var group = nowjs.getGroup(this.now.group); 
	group.now.statuses[index] = value;
	group.now.updateButtons();
}

everyone.now.addToBoard = function(cObj){ 
  // console.log(cObj);
  var pos = cObj.pos;
  var array = cObj.moveArray;
  var group = nowjs.getGroup(this.now.group);
  group.game.placeStones(this.user.player, array);
  //g.printBoard(game.board);
  group.now.stableBoard = group.game.board;
	group.now.eraseTemp(array);
  group.now.drawBoard(group.game.board);
}

everyone.now.clearBoard = function(){
  var group = nowjs.getGroup(this.now.group);
  group.game.clearBoard();
  group.now.stableBoard = group.game.board;
  group.now.drawBoard(group.game.board);
}

nowjs.on("connect", function() {
}); 

nowjs.on("disconnect", function() {
	if (this.now.myP >-1) {
		everyone.now.setStatus(this.now.myP, "-1");
	}
   // console.log("Left: " + this.now.name);
 	//everyone.now.updateList();
});

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
