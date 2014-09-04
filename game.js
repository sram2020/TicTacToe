var numberOfGames=0;
var gameList = [];
var playerCount=0
var clients = [];

exports.createNewGame = function (socket) {
	//console.log('game.js createNewGame');
	numberOfGames +=1;
	
	var game= new ticTacToe(socket,numberOfGames,playerCount);
	gameList.push(game);
	numberOfGames += 1;
	clients.push(socket);
	playerCount += 1;
	console.log('numberOfGames: '+numberOfGames-1);
	var gameNum= numberOfGames-1;
	socket.emit('newGameCreated', { game_id: gameNum});

}


exports.getAvailGame = function (socket) {
	//console.log('game.js getAvailGame');

	for (var i = 0; i < gameList.length; i++)
	{
		var gameVar = gameList[i];
		if (gameVar.player2 == -1)
		{
			//console.log('i value: '+i);
			//console.log('game.js getAvailGame inside if looop');			
			gameList[i].player2 = playerCount;
			clients.push(socket);
			playerCount += 1;
			gameList[i].numOfPlayers = 2;
			console.log('gameList[i].player1 : '+gameList[i].player1);
			console.log('gameList[i].player2 : '+gameList[i].player2);
			play1Socket= clients[gameList[i].player1];
			play2Socket= clients[gameList[i].player2];
			play1Socket.emit('gameStart',{ game_token: gameList[i].game_token, turn: gameList[i].player1Turn });
			play2Socket.emit('gameStart',{ game_token: gameList[i].game_token, turn: !gameList[i].player1Turn });
			return;
		}
	}
	socket.emit('noAvailGames');
}


var move = function(game,socket,data,io)
{
	var play1Socket= clients[game.player1];
	var play2Socket= clients[game.player2];

	//console.log('game.js move');
	//console.log('yyyyyplayer1: '+game.player1 + ' player2: '+ game.player2);
	//console.log('yyyyyplay1Socket: '+play1Socket + ' play2Socket: '+ play2Socket);
	if(game.winner!= -1)
	{
		socket.emit('hihello','Game Over!! You cannot move further!! Please close the window and open a new game.');
		return;
	}
	if((play1Socket == socket && !game.player1Turn) || (play2Socket == socket && game.player1Turn))
	{
		socket.emit('hihello','Not Your Turn');
		return false;
	}

	var val = parseFloat(data.value)-1;
	//console.log('game.js move ::Value : '+ val);
	if(game.isFilled(val)==true)
	{
		socket.emit('hihello',"Invalid square is clicked");
		return false;
	}

	if(game.player1Turn == true)
	{
		game.board[val] = 1;
		//console.log('game.js move ::player value : 1');
	}
	else
	{
		game.board[val] = 2;
		//console.log('game.js move ::player value : 2');
	}
	//console.log('game.js move ::data.sign: '+ game.board[val]);
	data.sign = game.board[val];
	game.player1Turn = !game.player1Turn;
	io.sockets.emit('playmove', {game_token : data.game_token, value : val+1, sign : game.board[val] ,turn: game.player1Turn});
	io.sockets.emit('playmove', {game_token : data.game_token, value : val+1, sign : game.board[val] ,turn: game.player1Turn});
	var winner = game.checkWin(game.board);
	//console.log('game.js move :: checkWin: '+winner);
	if (winner || game.isFull()) {
		game.winner = winner;
		play1Socket.emit('gameOver', { winner: winner });
		play2Socket.emit('gameOver', { winner: winner });
		return true;
	}
	return false;
}

exports.playMove = function(socket,data,io){
	
	var game = gameList[data.game_token-1];
	console.log('game.js playMove:: token: '+data.game_token-1);
	console.log('game object:xxxxxxxxxx '+game);
	if(game == undefined)
	{
		socket.emit('hihello', 'Invalid Game token!');
		return;
	}
	console.log('game.js playMove:: going to move');
	if(move(game,socket,data,io)==false)
	{
		//delete gameList[data.game_token];
	}
}

function isFull(){

	for(var i=0; i<9;i++)
	{
		if(this.board[i] == 0){
			 return false;
		}
	}
	return true;
}

function checkWin(board)
{
	// Across
	if ((board[0] == board[1] && board[1] == board[2]) && board[0])
		return board[0];

	if ((board[3] == board[4] && board[4] == board[5]) && board[3])
		return board[3];

	if ((board[6] == board[7] && board[7] == board[8]) && board[6])
		return board[6];

	// Down
	if ((board[0] == board[3] && board[3] == board[6]) && board[0])
		return board[0];

	if ((board[1] == board[4] && board[4] == board[7]) && board[1])
		return board[1];

	if ((board[2] == board[5] && board[5] == board[8]) && board[2])
		return board[2];

	// Diagonal

	if ((board[0] == board[4] && board[4] == board[8]) && board[0])
		return board[0];

	if ((board[6] == board[4] && board[4] == board[2]) && board[6])
		return board[6];

	return 0;
}


function isFilled(val) {
    if (this.board[val] == 0) {
        return false;
    } else {
        return true;
    }
}


var ticTacToe = function (socket,game_token,player1) {
    this.board = new Array(0,0,0,0,0,0,0,0,0);
    this.isFilled = isFilled;
    this.checkWin = checkWin;
    this.isFull = isFull;
	this.game_token = game_token;
	this.winner =-1
	this.numOfPlayers=1;
	this.player1Turn = true;
	this.player1 = player1;
	this.player2 = -1;
}
