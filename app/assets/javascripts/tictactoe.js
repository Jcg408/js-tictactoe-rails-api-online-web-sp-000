const WIN_COMBIN = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
var turn = 0;
var currentGame = 0;

$(document).ready(function() {
    attachListeners();
});

function player() {
    if (turn % 2 == 0) {
        return "X";
    } else {
        return "O";
    }
};


function updateState(token) {
    $(token).text( player() );
};

function setMessage(msg) {
      $('#message').text(msg);
  };


function doTurn(square) {
    updateState(square);
    turn++;
    if (checkWinner()) {
        saveGame();
        resetGame();
    } else if (turn === 9) {
        setMessage("Tie game.");
        saveGame();
        resetGame();
    }
}

function saveGame() {
    var state = [];
    var gameData = {state: state};
    $('td').text((index, square) => {state.push(square);
    });
    if (currentGame) {
      $.ajax({
        type: 'PATCH',
        url: `/games/${currentGame}`,
        data: gameData
      });
    } else {
      $.post('/games', gameData, function(game) {
        currentGame = game.data.id;
        $('#games').append(`<button id="gameid-${game.data.id}">${game.data.id}</button><br>`);
        $("#gameid-" + game.data.id).on('click', () => reloadGame(game.data.id));
      });
    }
  }

function previousGames() {
    $('#games').empty();
    $.get('/games', function(games){
        if (games.data.length) {
            games.data.forEach(prevGameButton);
        }
    });
}

function prevGameButton(game){
    $('#games').append(`<button id="gameid-${game.id}">${game.id}</button><br>`);
    $(`#gameid-${game.id}`).on('click', () => reloadGame(game.id));
}

function reloadGame(gameId){
    $('#message').innerHTML = '';

    $.get(`/games/${gameId}`, function(gameData) {
        debugger
        const id = gameData.data.id;
        const state = gameData.data.attributes.state;

        let index = 0;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
            document.querySelector(`[data-x="${x}"][data-y="${y}"]`).innerHTML = state[index];
            index++;
            }
        } 

        turn = state.join('').length;
        currentGame = id;
    })
}

function clearGame() {
    resetGame();
}

function resetGame() {
    currentGame = 0;
    $('td').empty();
    turn = 0;
    setMessage('');
  }

function attachListeners() {
    $('td').on('click', function() {
        if (!$.text(this) && !checkWinner()) {
            doTurn(this);
          }
    });

    $('#save').on('click', () => saveGame());
    $('#previous').on('click', () => previousGames());
    $('#clear').on('click', () => clearGame());
}

var checkWinner = () => {
    var board = {};
    var winner = false;

    $('td').text((index, square) => board[index] = square);

    const WIN_COMBIN = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];

    WIN_COMBIN.forEach(function(combo) {
        if (board[combo[0]] !== "" && board[combo[0]] === board[combo[1]] && board[combo[1]] === board[combo[2]]) {
        setMessage(`Player ${board[combo[0]]} Won!`);
        return winner = true;
        }
    });

  return winner;
}