###
This file contains game logic which may be used on the client OR server.
In MVC, these classes are models.

NOTE: The coordinate system used for the board is inverted across the x-axis
with the origin in the top right.
###


_ = require('underscore')


DIRS = ['W', 'N', 'E', 'S']
EMPTY = -1 # Never use -1 as a player id!


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
    switch @direction
      when 'E' then @x++
      when 'S' then @y++
      when 'W' then @x--
      when 'N' then @y--
    @path.push @position()
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

  pointWithinPath: (x, y) =>
    # Implementation of point in polygon algorithm.
    # This won't be accurate for points on the edge.
    pointsToLeft = _.filter(@path, (p) -> p.x < x and p.y == y).length
    pointsToRight = _.filter(@path, (p) -> p.x > x and p.y == y).length
    pointsToRight % 2 == 1 and pointsToRight % 2 == 1

  atStart: =>
    _.isEqual @path[0], @position()

  pointAtPosition: (p) =>
    p.x == @x and p.y == @y

class Game
  constructor: (@height, @width) ->
    @board = ((EMPTY for numa in [1..width]) for num in [1..height])

  placeStone: (player, x, y) =>
    if x < @width and y < @height and @board[x][y] == EMPTY
      # That spot is on the board and it's empty.
      @board[x][y] = player.id
      toFill =  @innerPaths(x, y)
      for p in toFill
        @fill p, player.id
      true
    else
      false

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
    starts = [
      {x: lastX,     y: lastY + 1, d: 'W'}
      {x: lastX - 1, y: lastY,     d: 'N'}
      {x: lastX,     y: lastY - 1, d: 'E'}
      {x: lastX + 1, y: lastY,     d: 'S'}
    ] # list of start positions for possible paths
    lastPlayer = @board[lastX][lastY]
    for s, i in starts
      # Make sure this is a valid start for an inner path.
      if @board[s.x][s.y] != lastPlayer and @board[s.x][s.y]?
        # Make a Pathfinder and let it explore!
        pf = new Pathfinder(s.x, s.y, s.d)

        front = pf.front()
        right = pf.right()
        left = pf.left()

        while not pf.atStart() or pf.path.length < 4
          # if not @board[front.x]? or not @board[front.x][front.y]?
          #   # We hit the edge, this can't be an inner path.
          #   break
          
          # http://www.micromouseinfo.com/introduction/wallfollow.html
          if @board[right.x][right.y] != lastPlayer
            pf.turnRight()

          else if @board[front.x][front.y] != lastPlayer

          else if @board[left.x][left.y] != lastPlayer
            pf.turnLeft()

          else
            pf.turnAround()

          pf.move()

          # Check to the front and right.
          front = pf.front()
          right = pf.right()
          left = pf.left()

        if pf.atStart()
          pf.path.pop() # We only want 1 copy of the starting pos.

        if not pf.pointWithinPath(lastX, lastY)
          console.log pf.path
          paths.push pf.path
        pf.path = []
    paths

  fill: (path, playerID) ->
    groups = _.groupBy path, (p) -> p.x
    inside = true
    for x, xGroup in groups
      sorted = _.pluck xGroup.sort(), 'y'
      nextY = sorted.pop()
      for y in [_.min(sorted).._.max(sorted)]
        @board[x][y] == playerID if inside
        if y == nextY
          nextY = sorted.pop()
          inside = not inside


# DEBUGGING
# #########

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

g = new Game(10, 10)
peter = new Player('Peter', 33)
bill = new Player('Bill', 2) 
g.placeStone peter, 1, 1
g.placeStone peter, 1, 2
g.placeStone peter, 1, 3
g.placeStone peter, 2, 3
g.placeStone peter, 3, 3
g.placeStone peter, 4, 3
g.placeStone peter, 4, 2
g.placeStone peter, 4, 1
g.placeStone peter, 3, 1
g.placeStone peter, 2, 1
printBoard g 




