###
This file contains game logic which may be used on the client OR server.
In MVC, these classes are models.

NOTE: The coordinate system used for the board is inverted across the x-axis
with the origin in the top right.
###

_ = require('underscore')

DIRS = ['W', 'N', 'E', 'S']
EMPTY = -1 # Never use -1 as a player id!

pointInPolygon = (poly, x, y) =>
  # Implementation of point in polygon algorithm.
  # This won't be accurate for points on the edge.
  pointsToLeft = _.filter(poly, (p) -> p.x < x and p.y == y).length
  pointsToRight = _.filter(poly, (p) -> p.x > x and p.y == y).length
  pointsToRight % 2 == 1 and pointsToRight % 2 == 1
  
class Player
  constructor: (@name, @id, @score) ->

class Game
  constructor: (@height, @width) ->
    @board = ((EMPTY for numa in [1..width]) for num in [1..height])
    @players = []

  onBoard: (x, y) =>
    x < @width and x >= 0 and y < @height and y >= 0

  # Flood fill empty polygon containing (x,y) and surrounded by cells with the
  # replacement color.
  floodFill: (x, y, replacement) =>
    # http://en.wikipedia.org/wiki/Flood_fill
    toFlood = []
    q = []
    return false if @board[x][y] != EMPTY
    q.push [x, y]
    while q.length > 0
      n = w = e = q.pop()

      # Move w/e west/east until it is no longer at an empty space.
      while @board[w[0]]? and @board[w[0]][w[1]] == EMPTY
        w = [w[0] - 1, w[1]]
      while @board[e[0]]? and @board[e[0]][e[1]] == EMPTY
        e = [e[0] + 1, e[1]]

      # Don't flood if the correct player isn't surrounding.
      if shouldFlood and (not @board[w[0]]? or not @board[e[0]]? or @board[w[0]][w[1]] != replacement or @board[e[0]][e[1]] != replacement)
        shouldFlood = false

      between = ([x, n[1]] for x in [w[0]+1..e[0]-1])
      toFlood.append between

      # Check/add nodes north/south of nodes between n and w.
      q.append (xy for xy in between when @board[x][xy[1]-1] == EMPTY)
      q.append (xy for xy in between when @board[x][xy[1]+1] == EMPTY)

    if shouldFlood # then flood
      for [x, y] in toFlood
        @board[x][y] = replacement

    'toFlood': toFlood
    'didFlood': shouldFlood

  neighbors: (xy) ->
    x = xy[0]
    y = xy[1]
    [
      [x+1][y]
      [x-1][y]
      [x][y-1]
      [x][y+1]
    ]

  # Param stones is an array of [x,y] arrays.
  placeStones: (player, stones) =>
    _.map stones, (s) -> @board[s[0]][s[1]] = player.id
    neighbors = _.union(_.map(stones, @neighbors))
    emptyNeighbors = _.filter neighbors, (n) -> @board[n[0]]? and @board[n[0]][n[1]] == EMPTY
    didFlood = false
    for [x, y] in emptyNeighbors
      flooded = floodFill x, y, player.id
      emptyNeighbors = _.without emptyNeighbors flooded.toFlood
      if not didFlood and flooded.didFlood
        didFlood = true
    if not didFlood # then unplace the stoens
      _.map stones, (s) -> @board[s[0]][s[1]] = EMPTY
    didFlood

  addPlayer: (name, id) =>
    player = new Player(name, id, 0)
    @players.push player
    player

  checkWinner: =>
    _.max @players, (p) -> p.score

printBoard = (g) ->
  # FOR DEBUGGING  
  console.log '================================'
  s = ''
  for colNum in [0..g.board[0].length-1]
    s = ''
    for row in g.board
      s += row[colNum]
      s += ' '
    console.log s
  console.log '================================'  

exports.Game = Game
exports.Player = Player
exports.printBoard = printBoard
