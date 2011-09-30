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
//var game = require("./ghost");
var everyone = nowjs.initialize(server);

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
  var name = cObj.name;
  var x = cObj.x;
  var y = cObj.y;
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
    everyone.now.drawBoard(liveBoard);
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
  liveBoard = [];
  for(var i = 0; i < 16; i ++){
    liveBoard[i] = [];
  }
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