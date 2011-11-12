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
  constructor: (@height, @width, @gameoverRatio) ->
    @gameoverRatio ?= .8 # min percent of board full before game is over
    @board = ((EMPTY for numa in [1..width]) for num in [1..height])
    @players = []

  onBoard: (x, y) =>
    x < @width and x >= 0 and y < @height and y >= 0

  # Flood fill empty polygon containing (x,y) and surrounded by cells with the
  # replacement color.
  # Return an array of the points that were flooded.
  floodFill: (x, y, replacement) =>
    # http://en.wikipedia.org/wiki/Flood_fill
    # Target color = EMPTY.
    flooded = []
    q = []
    # If the space is already filled, return early.
    return flooded if (not @board[x]?) or @board[x][y] != EMPTY
    q.push [x, y]
    while q.length > 0
      n = w = e = q.pop() # n is the start point (node)
      if @board[n[0]]? and @board[n[0]][n[1]] == EMPTY

        # Move w/e west/east until it is no longer at an empty space.
        while @board[w[0]]? and @board[w[0]][w[1]] == EMPTY
          w = [w[0] - 1, w[1]]
        while @board[e[0]]? and @board[e[0]][e[1]] == EMPTY
          e = [e[0] + 1, e[1]]

        # Flood points between w and e.
        between = ([x, n[1]] for x in [w[0]+1..e[0]-1]) if not _.isEqual w, e
        # Fill and continue on this path if w != e.
        if between?
          for xy in between
            @board[xy[0]][xy[1]] = replacement
          flooded = flooded.concat between

          # Add nodes north/south of nodes between n and w when they are of target color.
          q = q.concat ([xy[0], xy[1]-1] for xy in between when @board[xy[0]]?[xy[1]-1] == EMPTY)
          q = q.concat ([xy[0], xy[1]+1] for xy in between when @board[xy[0]]?[xy[1]+1] == EMPTY)

    flooded

  neighbors: (xy) ->
    x = xy[0]
    y = xy[1]
    [
      [x + 1, y]
      [x - 1, y]
      [x, y - 1]
      [x, y + 1]
    ]

  setEmpty: (points) =>
    for xy in points
      @board[xy[0]][xy[1]] = EMPTY

  # Param stones is an array of [x,y] arrays.
  placeStones: (player, stones) =>
    _.map stones, (s) => @board[s[0]][s[1]] = player.id
    neighbors = [].concat(_.map(stones, @neighbors)...)
    didFlood = false
    for [x, y] in neighbors
      flooded = @floodFill x, y, player.id
      # If any of the flooded points is touching the edge or another player's
      # stones, then unflood.
      for xy in flooded
        if not xy?
          continue
        for n in @neighbors(xy)
          if @board[n[0]]?[n[1]] != player.id
            @setEmpty flooded
            flooded = []
      if flooded.length > 0
        didFlood = true

      neighbors = _.without(neighbors, flooded...)
    if not didFlood # then unplace the stones
      @setEmpty stones

    didFlood

  addPlayer: (name, id) =>
    player = new Player(name, id, 0)
    @players.push player
    player

  checkWinner: =>
    _.max @players, (p) -> p.score

  checkGameOver: =>
    _.without(_.flatten(@board), EMPTY).length < @height*@width*@gameoverRatio

  clearBoard: =>
    @board = ((EMPTY for numa in [1..@width]) for num in [1..@height])

printBoard = (board) ->
  # FOR DEBUGGING  
  console.log '================================'
  s = ''
  for colNum in [0..board[0].length-1]
    s = ''
    for row in board
      s += row[colNum]
      s += ' '
    console.log s
  console.log '================================'  

exports.Game = Game
exports.Player = Player
exports.printBoard = printBoard
