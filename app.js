var fs = require('fs');
var $ = require('jquery');
var server = require('http').createServer(function(req, response){
  fs.readFile(__dirname+'/index2.html', function(err, data){
    response.writeHead(200, {'Content-Type':'text/html'});
    response.write(data);
    response.end();
  });
});
server.listen(8080);
var nowjs = require("now");
var g = require("./ghost");
var everyone = nowjs.initialize(server);

// This is how you use the game...
var game = new g.Game(10, 10);
var peter = game.addPlayer('peter', '33');
var bill = game.addPlayer('bill', '22');
game.placeStone(peter, 1, 1);
game.placeStone(peter, 1, 0);
game.placeStone(peter, 3, 0);
// game.placeStone(peter, 3, 2);
// game.placeStone(peter, 1, 2);
// game.placeStone(peter, 2, 3);
// game.placeStone(peter, 3, 1);
console.log(peter.score);
console.log(game.checkWinner());
g.printBoard(game);


everyone.now.distributeMessage = function(message){
  everyone.now.receiveMessage(this.now.name, message);
};
/*
var game = new Game;
everyone.now.board = game.board;
*/
everyone.now.clients = [];
var board = [];
for(var i = 0; i < 16; i ++){
  board[i] = [];
}

everyone.now.addToImage = function(name,cObj){
  console.log(cObj);
  var name = cObj.name;
  var x = cObj.x;
  var y = cObj.y;
  if(board[x][y] === undefined){
    board[x][y] = blue;
  }
  else if (board[x][y] == name){
    //EVALUATE IF SOMEONE OCCUPIES THAT SPACE
    
  }
  
  /*
  var pos = ArrayIndexOf(everyone.now.clients, function(obj){
      return obj.name == name;
  });
  */
  //console.log("pos = "+pos);
  //console.log($.makeArray(everyone.now.clients[pos].draw).constructor.toString());
  console.log(everyone.now.clients[pos].draw);
  everyone.now.clients[pos].draw = $.makeArray(everyone.now.clients[pos].draw);
  console.log(everyone.now.clients[pos].draw);
  everyone.now.clients[pos].draw.push(cObj);
  console.log(everyone.now.clients[pos].draw);
  
}

everyone.now.setName = function(name){
  console.log(everyone.now.clients);
  console.log(name);
  var pos = ArrayIndexOf(everyone.now.clients, function(obj){
      return obj.name == name;
  });
  console.log(pos);
  if(pos > -1){
    this.now.askName("name is taken");
  }
  else{
    console.log(name);
    var myObj = name;
    //var tmpArray = new Array([0,0],[1,1]);
    var myObj = {name:name,draw:[]};
    this.now.name = name;
    everyone.now.clients.push(myObj);
    console.log(myObj.draw.constructor.toString());
    console.log(everyone.now.clients[0].draw.constructor.toString());
    console.log($.makeArray(everyone.now.clients[0].draw).constructor.toString());
    console.log(everyone.now.clients);
    everyone.now.updateList();
    console.log("Joined: " + name);
  }
}

nowjs.on("connect", function() {
    
});
nowjs.on("disconnect", function() {
  console.log(this.now.name);
  var left = this.now.name;
        var pos = ArrayIndexOf(everyone.now.clients, function(obj){
            return obj.name == left;
        })
        console.log()
        console.log(pos);
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
