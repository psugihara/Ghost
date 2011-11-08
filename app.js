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
var peter = new g.Player('Peter', '0');
var bill = new g.Player('Billy', '1');
// STONES WILL ONLY BE PLACED IF THEY MAKE A CONNECTED SHAPE!
game.placeStones(peter, [[1,1], [1,3], [2,2], [0,2]]);
g.printBoard(game.board)
everyone.now.stableBoard = (game.board);
everyone.now.clients = [];



everyone.now.distribute_draw = function(x,y){
  	everyone.now.receive_draw(x, y);
}


everyone.now.addToBoard = function(cObj){ 
    
  console.log(cObj);
  var name = cObj.name;
  var array = cObj.moveArray;
  game.placeStones(peter, array);
  g.printBoard(game.board);
  everyone.now.stableBoard = game.board;
  everyone.now.drawBoard(game.board);
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


everyone.now.clearBoard = function(){
  game = new g.Game(everyone.now.GAMEWIDE, everyone.now.GAMEHIGH);
  peter = new g.Player('Peter', '33');
  bill = new g.Player('Billy', '22');
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
