class Player

  constructor: (@name, @id, @score) ->


class Game

  constructor: (@height, @width) ->
    @board = ((null for numa in [1..width]) for num in [1..height])
    @players = []

  # addPlayer: (name, id) ->
  #   players.push new Player(name, id)
  
  placeStone: (player, x, y) ->
    if x < @width and y < @height and @board[x][y]?
      # That spot is on the board and it's empty.
      @board[y][x] = player.id

      # Check the row for spots we should change.
      row = @board[y]
      rightEndpoint = leftEndpoint = y
      # Check right
      for id, i in row[x..]
        if id == player.id
          rightEndpoint = i
          break
        break unless id? # We're at the end of a row
      # Check left
      for id, i in row[..x].reverse()
        if id == player.id
          leftEndpoint = i
          break
        break unless id?

      # # Check the column for spots we should change.
      # col = (
      

      return true
    else
      return false

printBoard = (g) ->
  for row in g.board
    console.log row

g = new Game(10, 10)
peter = new Player('Peter', 1)
bill = new Player('Bill', 2) 
# g.addPlayer('Bill', 2)
g.placeStone(peter, 1, 1)
printBoard(g)
