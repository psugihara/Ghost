# This file contains game logic which may be used on the client OR server.
# In MVC, these classes are models.


class Player

  constructor: (@name, @id, @score) ->


class Game

  constructor: (@height, @width) ->
    @board = ((undefined for numa in [1..width]) for num in [1..height])

  placeStone: (player, x, y) =>
    if x < @width and y < @height and @board[x][y]?
      # That spot is on the board and it's empty.
      @board[y][x] = player.id
      @checkBoard x, y
      true
    else
      false

  checkBoard: (lastX, lastY) =>
    neighbors = @neighbors lastX, lastY
    paths = []
    # TODO Find paths, fill and store new cycles.

  # Return an array of neighbors.
  # Neighbors are not necessarilly adjacent:
  #      012
  #      3X4
  #      567
  neighbors: (x, y) ->
    [
      @board[y-1][x-1]  #0
      @board[y-1][x]    #1
      @board[y-1][x+1]  #2
      @board[y][x-1]    #3
      @board[y][x+1]    #4
      @board[y-1][x-1]  #5
      @board[y-1][x]    #6
      @board[y-1][x+1]  #7
    ]

  fillCycle: (path) ->



# DEBUGGING
# #########

printBoard = (g) ->
  for row in g.board
    console.log row

g = new Game(10, 10)
peter = new Player('Peter', 1)
bill = new Player('Bill', 2) 
g.placeStone peter, 1, 1
printBoard g 
