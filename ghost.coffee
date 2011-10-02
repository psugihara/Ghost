###
This file contains game logic which may be used on the client OR server.
In MVC, these classes are models.

NOTE: The coordinate system used for the board is inverted across the x-axis
with the origin in the top right.
###


_ = require('underscore')


DIRS = ['W', 'N', 'E', 'S']
EMPTY = -1 # Never use -1 as a player id!


# [1, 2, 3, 4] -> [[1, 2], [3, 4]]
# [1] -> 
# pair = (list) ->
#   if list.length <= 1
#     return [list[0], list[0]]
#   even = (item for item in list when _i%2==0)
#   odd = (item for item in list when _i%2==1)
#   _.zip even, odd

pointInPolygon = (poly, x, y) =>
  # Implementation of point in polygon algorithm.
  # This won't be accurate for points on the edge.
  pointsToLeft = _.filter(poly, (p) -> p.x < x and p.y == y).length
  pointsToRight = _.filter(poly, (p) -> p.x > x and p.y == y).length
  pointsToRight % 2 == 1 and pointsToRight % 2 == 1
  
class Player
  constructor: (@name, @id, @score) ->


class Pathfinder
  constructor: (@x, @y, @direction) ->
    @path = []
    @turnLeft = (=>
        # The slice returns a (shallow) copy of the array.
        revDirs = DIRS.slice().reverse()
        =>
          dir = revDirs.indexOf @direction          
          dir = (dir + 1) % 4
          @direction = revDirs[dir]
          @
      )()

  turnRight: =>
    dir = DIRS.indexOf @direction          
    dir = (dir + 1) % 4
    @direction = DIRS[dir]
    @

  turnAround: =>
    dir = DIRS.indexOf @direction
    dir = (dir + 2) % 4
    @direction = DIRS[dir]
    @

  move: =>
    @path.push @position()
    switch @direction
      when 'E' then @x++
      when 'S' then @y++
      when 'W' then @x--
      when 'N' then @y--
    @

  front: ->
    switch @direction
      when 'E' then x: @x+1, y: @y
      when 'S' then x: @x,   y: @y+1
      when 'W' then x: @x-1, y: @y
      when 'N' then x: @x,   y: @y-1

  right: ->
    switch @direction
      when 'E' then x: @x,   y: @y+1
      when 'S' then x: @x-1, y: @y
      when 'W' then x: @x,   y: @y-1
      when 'N' then x: @x+1, y: @y

  left: ->
    switch @direction
      when 'E' then x: @x,   y: @y-1
      when 'S' then x: @x+1, y: @y
      when 'W' then x: @x,   y: @y+1
      when 'N' then x: @x-1, y: @y

  position: =>
    {x: @x, y: @y}

  atStart: =>
    _.isEqual @path[0], @position()

  pointAtPosition: (p) =>
    p.x == @x and p.y == @y

class Game
  constructor: (@height, @width) ->
    @board = ((EMPTY for numa in [1..width]) for num in [1..height])
    @players = []

  placeStone: (player, x, y) =>
    if x < @width and y < @height and @board[x][y] == EMPTY
      # That spot is on the board and it's empty.
      @board[x][y] = player.id
      toFill =  @innerPaths(x, y)
      for p in toFill
        @fill p, player.id
      player.score = _.select(_.flatten(@board), (id) -> id == player.id).length
      true
    else
      false

  onBoard: (x, y) =>
    x < @width and x >= 0 and y < @height and y >= 0
  
  # Return inner paths adjacent to the last played stone.
  # So if X's are the last player's pieces,
  #    XXXX
  #   X012X
  #    XX3X
  #      X
  #   we'd return [[x0, y0], [x1, y1], [x2, y2], [x3, y3]].
  # Note: The path may contain positions where other players have played.
  innerPaths: (lastX, lastY) =>
    paths = []
    # We look for 'inner paths' by placing our right hand on the wall and
    # walking around. The wall is the last player's stones.
    # Adapted from http://www.micromouseinfo.com/introduction/wallfollow.html 
    starts = [
      {x: lastX,     y: lastY + 1, d: 'W'}
      {x: lastX - 1, y: lastY,     d: 'N'}
      {x: lastX,     y: lastY - 1, d: 'E'}
      {x: lastX + 1, y: lastY,     d: 'S'}
    ] # list of start positions for possible paths
    lastPlayer = @board[lastX][lastY]
    for s, i in starts
      # Make sure this is a valid start for an inner path.
      if @onBoard(s.x, s.y) and @board[s.x][s.y] != lastPlayer
        # Make a Pathfinder and let it explore!
        pf = new Pathfinder(s.x, s.y, s.d)

        front = pf.front()
        right = pf.right()
        left = pf.left()

        while not pf.atStart() or pf.path.length < 2
          if not @onBoard(right.x, right.y) or not @onBoard(front.x, front.y)
            pf.hitEdge = true
            break # We hit the edge, this can't be an inner path.

          if @board[right.x][right.y] != lastPlayer
            pf.turnRight()

          else if @onBoard(front.x, front.y) and @board[front.x][front.y] != lastPlayer

          else if @onBoard(left.x, left.y) and @board[left.x][left.y] != lastPlayer
            pf.turnLeft()

          else
            pf.turnAround()

          # Can we move ahead?
          front = pf.front()
          if @board[front.x][front.y] == lastPlayer
            pf.path.push pf.position()
          else if @onBoard(front.x, front.y)
            pf.move()

          # Check to the front and right.
          front = pf.front()
          right = pf.right()
          left = pf.left()

        if not pf.hitEdge and pf.atStart()
          if not pointInPolygon(pf.path, lastX, lastY) and pf.path.length > 0
            paths.push pf.path # We didn't encircle the stone that was placed.
    paths

  fill: (path, playerID) ->
    groups = _.groupBy path, (p) -> p.x
    # Fill path.
    for p in path
      @board[p.x][p.y] = playerID
    # Fill inside of path.
    for x, xGroup of groups
      for y in [_.min(xGroup).._.max(xGroup)]
        if pointInPolygon path, x, y
          @board[x][y] = playerID
    # This is more efficient but doesn't work when there are solo points in a line.
    # XXXXXX
    # X    X
    # X X  X
    #  X X
    # for x, xGroup of groups
    #   sorted = _.pluck xGroup.sort(), 'y'
    #   for i in [0..sorted.length] by 2
    #     for y in [sorted[i]..(sorted[i+1] or sorted[i])]
    #       @board[x][y] = playerID 

  addPlayer: (name, id) =>
    player = new Player(name, id, 0)
    @players.push player
    player

  checkWinner: =>
    _.max @players, (p) -> p.score

# DEBUGGING
printBoard = (g) ->
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
