
var express = require('express');
var app =  express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var game = require('./game');

var clients = [];
var rooms = [];
var numOfPlayers= 0;

app.get('/',function(request,response){
	response.sendfile('./home.html');
});
app.use(express.static(path.join(__dirname, 'public')));

http.listen(8800,function(){
	console.log('Server started in Port 8800');
});

io.on('connection',function(socket){

	//console.log('socket connected');
	socket.on('getAvailGame',function(data){
		console.log('main.js getAvailGame:');
		game.getAvailGame(socket);
	});


	socket.on('createNewGame',function(data){
		console.log('main.js createNewGame');
		game.createNewGame(socket);
	});

	socket.on('move',function(data){
		console.log('main.js move');
		game.playMove(socket,data,io);
	});

});
