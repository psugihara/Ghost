ArrayIndexOf = (a, fnc) ->
  return -1  if not fnc or typeof (fnc) != "function"
  return -1  if not a or not a.length or a.length < 1
  i = 0
  
  while i < a.length
    return i  if fnc(a[i])
    i++
  -1
  
  
fs = require 'fs'

express = require 'express'
app = express.createServer()

# serve JS files
app.get '/:jsfile.js', (req, res) ->
	fs.readFile "./javascripts/#{req.params.jsfile}.js", (err, data) ->
		if err
			res.send 'not found', 404
		else
			res.header 'Content-Type', 'text/javascript'
			res.send data

app.get '/', (req, res) ->
	fs.readFile '../client/index.html', (err, html) ->
		res.contentType 'text/html'
		res.send html
		res.end

app.listen 8080


nowjs = require("now")
everyone = nowjs.initialize app
everyone.now.clients = [];


everyone.now.distribute_draw = (x, y) ->
	everyone.now.receive_draw x, y
	console.log "drawing"

everyone.now.distribute_name = (name) -> 
  everyone.now.clients.push name
  return everyone.now.receive_name
  console.log everyone.now.clients
  
  
  
  
  