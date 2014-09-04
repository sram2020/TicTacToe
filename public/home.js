            $(document).ready(function(){
                var socket = io.connect('http://localhost:8800');
                socket.emit('getAvailGame');
                console.log('home.html getAvailGame');
                var game_token = 0;
                var me = 2;

                socket.on('noAvailGames', function () {
                    $('#log').text('No available game, Please create new game');
                    //console.log('home.html noAvailGames');
                    socket.emit('createNewGame');
                });

                socket.on('newGameCreated',function(data){
                    $('#log').text('New Game Created,Waiting for other user to join');
                    game_token = data.game_id;
                    me =1;
                    $('#player').append('1');
                    //console.log('home.html newGameCreated: '+game_token);
                });

                socket.on('gameStart',function(data){
                    game_token = data.game_token;
                    var player1Turn = data.turn;
                    //console.log('home.html gameStart');
                    if(player1Turn)
                    {
                        $('#log').text("Game Started. Your turn!!");
                    }
                    else
                    {
                        $('#log').text('Opponent turn!!');
                        $('#player').append('2');
                    }
                });

                socket.on('playmove', function (data) {
                    //console.log('home.html::playmove');
                    var player1Turn = data.turn;
                    if(game_token == data.game_token)
                    {
                        //console.log('inside if')
                        var square = data.value;
                        //console.log('square : '+square);
                        var value = (data.sign == 1) ? 'X' : 'O';
                        //console.log('value: '+ value);
                        document.getElementById(data.value).innerHTML= value;
                    }
                    if((player1Turn && me ==1)||(!player1Turn && me ==2) )
                    {
                        $('#log').text('Next Move: Your turn!!');
                    }
                    else
                    {
                        $('#log').text('Next Move: Opponent turn!!');
                    }
                });

                socket.on('invalidMove', function (data) {
                    alert(data.description);
                    //console.log('home.html invalidMove');
                });

                socket.on('gameOver', function (data) {
                    //console.log('home.html gameOver');
                    if (data.winner == me){
                        alert('You won!');
                    }
                    else if (data.winner == 0){
                        alert('Draw');
                    }
                    else{
                        alert('You Lost');
                    }
                    $('.block').prop('disabled', true);
                    $('#log').text('Game Over!!!');
                });

                $('.block').click(function(){
                    var value = parseFloat(this.id);
                    //console.log('clicked: '+value+ '  game_token: '+game_token);
                    socket.emit('move',{game_token : game_token, value : value});
                });
                socket.on('hihello', function (data) {
                    alert(data);
                });
            });