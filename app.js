var fs = require('fs');
var server = require('http').createServer(function(req, response){
  fs.readFile(__dirname+'/index2.html', function(err, data){
    response.writeHead(200, {'Content-Type':'text/html'});
    response.write(data);
    response.end();
  });
});
server.listen(8080);
var nowjs = require("now");
var everyone = nowjs.initialize(server);

everyone.now.distributeMessage = function(message){
  everyone.now.receiveMessage(this.now.name, message);
};
everyone.now.clients = ["first"];

everyone.now.setName = function(name){
  console.log(name);
  var myObj = name;
  everyone.now.firstName = name;
  everyone.now.clients.push(myObj);
  console.log(everyone.now.clients);
  everyone.now.updateList();
  console.log("Joined: " + name);
}

nowjs.on("connect", function() {
    
});
nowjs.on("disconnect", function() {
        /*var pos = ArrayIndexOf(clients, function(obj){
            return obj.id == myObj.id;
        })
        if(pos >= 0){
            clients.splice(pos,1);
        }*/
 console.log("Left: " + this.now.name);
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