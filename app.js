var fs = require('fs')
  , $ = require('jquery')
  , express = require('express')
  , nowjs = require("now")
  , g = require("./gost");

var app = express.createServer();

app.use(express.static(__dirname + '/public/'));

app.get('/', function(req, res){
  fs.readFile(__dirname+'/templates/index2.html', function(err, data){
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write(data);
    res.end();
  });
});

app.listen(8080);


var everyone = nowjs.initialize(app);

everyone.now.GAMEUNIT = 20;
everyone.now.GAMEWIDE = 30;
everyone.now.GAMEHIGH = 30;

// This is how you use the game...
var game = new g.Game(everyone.now.GAMEWIDE, everyone.now.GAMEHIGH);
var peter = new g.Player('Peter', '33');
var bill = new g.Player('Billy', '22');
game.placeStones(peter, Array(Array(1,1),Array(2,2)));
g.printBoard(game)

console.log(bill);
/*
var game = new g.Game(10, 10);
var peter = game.addPlayer('peter', '33');
var bill = game.addPlayer('bill', '22');
game.placeStone(peter, 1, 1);
game.placeStone(peter, 2, 0);
game.placeStone(peter, 3, 0);
game.placeStone(peter, 3, 2);
game.placeStone(peter, 1, 2);
game.placeStone(peter, 2, 3);
game.placeStone(peter, 3, 1);
console.log(peter.score);
console.log(game.checkWinner());
g.printBoard(game);
*/

everyone.now.distributeMessage = function(message){
  everyone.now.receiveMessage(this.now.name, message);
};
/*
var game = new Game;
everyone.now.board = game.board;
*/
everyone.now.clients = [];
var deadBoard = [];
var liveBoard = [];
for(var i = 0; i < 16; i ++){
  deadBoard[i] = [];
  liveBoard[i] = [];
}

everyone.now.addToImage = function(cObj){
  console.log(cObj);
  var name = cObj.name;
  var x = cObj.x;
  var y = cObj.y;
  
  game.placeStone(bill, cObj.x, cObj.y);
  g.printBoard(game);
  //console.log(game.board);
  everyone.now.drawBoard(game.board);
  
  /*
  if(liveBoard[x] == undefined){
      liveBoard[x][y] = name;
      everyone.now.drawBoard(liveBoard);
  }
  else if(liveBoard[x][y] == undefined){
    liveBoard[x][y] = name;
    everyone.now.drawBoard(liveBoard);
  }
  else if (liveBoard[x][y] == name){
    //EVALUATE IF SOMEONE OCCUPIES THAT SPACE
  }
  else{
  }
  */
  
  
  /*
  var pos = ArrayIndexOf(everyone.now.clients, function(obj){
      return obj.name == name;
  });
  */
  //console.log("pos = "+pos);
  //console.log($.makeArray(everyone.now.clients[pos].draw).constructor.toString());
  /*console.log(everyone.now.clients[pos].draw);
  everyone.now.clients[pos].draw = $.makeArray(everyone.now.clients[pos].draw);
  console.log(everyone.now.clients[pos].draw);
  everyone.now.clients[pos].draw.push(cObj);
  console.log(everyone.now.clients[pos].draw);
  */
}

everyone.now.setName = function(name){
  console.log(name);
  var pos = ArrayIndexOf(everyone.now.clients, function(obj){
      return obj.name == name;
  });
  if(pos > -1){
    this.now.askName("name is taken");
  }
  else{
    var myObj = name;
    //var tmpArray = new Array([0,0],[1,1]);
    var myObj = {name:name,draw:[]};
    this.now.name = name;
    everyone.now.clients.push(myObj);
    everyone.now.updateList();
  
  this.now.oldBoard = [];
 // console.log(everyone.now.GAMEWIDE);
  for(i= 0;i<everyone.now.GAMEWIDE;i++){
    this.now.oldBoard[i] = [];
  //  console.log("i");
    for(var j = 0; j < everyone.now.GAMEHIGH; j++){
      this.now.oldBoard[i][j] = -1;
    }
  }

  this.now.drawBoard(game.board);



    console.log("Joined: " + name);
  }
}

nowjs.on("connect", function() {
    
});
nowjs.on("disconnect", function() {
  var left = this.now.name;
        var pos = ArrayIndexOf(everyone.now.clients, function(obj){
            return obj.name == left;
        })
        if(pos >= 0){
            everyone.now.clients.splice(pos,1);
        }
 console.log("Left: " + this.now.name);
 everyone.now.updateList();
});

everyone.now.distribute_draw = function(x,y){
  	everyone.now.receive_draw(x, y);
}

everyone.now.distributeMessage = function(message) {
  return everyone.now.receiveMessage(this.now.name, message);
};

everyone.now.clearBoard = function(){
  game = new g.Game(everyone.now.GAMEWIDE, everyone.now.GAMEHIGH);
  peter = new g.Player('Peter', '33');
  bill = new g.Player('Billy', '22');
  /*
  everyone.now.oldBoard = [];
  console.log(everyone.now.oldBoard);
  for(i= 0;i<everyone.now.GAMEWIDE;i++){
    everyone.now.oldBoard[i] = [];
    console.log(everyone.now.oldBoard[i]);
    for(var j = 0; j < everyone.now.GAMEHIGH; j++){
      everyone.now.oldBoard[i][j] = -1;
      console.log(everyone.now.oldBoard[i][j]);
    }
    console.log(everyone.now.oldBoard[i]);
  }
  console.log("cleared old board");
  console.log(everyone.now.oldBoard);
  console.log("cleared old board");
  */
  everyone.now.drawBoard("clear");
  
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
