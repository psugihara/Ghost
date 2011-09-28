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
    @turnRight = (=>
        dir = DIRS.indexOf @direction
        =>
          dir = (dir + 1) % 4
          @direction = DIRS[dir]
          @
      )()
    @turnLeft = (=>
        dir = DIRS.indexOf @direction
        # The slice returns a (shallow) copy of the array.
        revDirs = DIRS.slice().reverse()
        =>
          dir = (dir + 1) % 4
          @direction = revDirs[dir]
          @
      )()

  move: ->
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

  position: ->
    {x: @x, y: @y}

  # Furthest Pathfinder has explored in each direction:
  farEast: ->
    _.max(pos[0] for pos in @path)

  farWest: ->
    _.min(pos[0] for pos in @path)

  farNorth: ->
    _.min(pos[1] for pos in @path)

  farSouth: ->
    _.max(pos[1] for pos in @path)


class Game
  constructor: (@height, @width) ->
    @board = ((EMPTY for numa in [1..width]) for num in [1..height])

  placeStone: (player, x, y) =>
    if x < @width and y < @height and @board[x][y] == EMPTY
      # That spot is on the board and it's empty.
      @board[x][y] = player.id
      @fill @innerPaths(x, y)
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
      x: lastX,     y: lastY + 1, d: 'W'
      x: lastX - 1, y: lastY,     d: 'N'
      x: lastX,     y: lastY - 1, d: 'E'
      x: lastX + 1, y: lastY,     d: 'S'
    ] # list of start positions for possible paths
    lastPlayer = @board[lastX][lastY]

    for s, i in starts
      # Make sure this is a valid start for an inner path.
      if @board[s.x][s.y] != lastPlayer and @board[s.x][s.y]? and not s.visited
        # Make a pf and let it explore!
        pf = new Pathfinder(s.x, s.y, s.d)

        front = pf.front()
        right = pf.right()

        while not _.isEqual(_.last(pf.path), _.first(pf.path)) or pf.path.length < 4
          pf.paths.push pf.position()

          if @board[right.x][right.y] != lastPlayer
            # console.log 'turn right'
            pf.turnRight().move()

          else if not @board[front.x]? or not @board[front.x][front.y]?
            # We hit the edge, this can't be an inner path.
            break

          else if @board[front.x][front.y] == lastPlayer
            # console.log 'turn left'
            pf.turnLeft().move()

          else if @board[front.x][front.y] != lastPlayer
            # console.log 'move'
            pf.move()

          # Check to the front and right.
          front = pf.front()
          right = pf.right()

        paths.push pf.path
        s.visited = true
    paths

  fill: (path) ->



# DEBUGGING
# #########

printBoard = (g) ->
  for row in g.board
    console.log row

g = new Game(10, 10)
peter = new Player('Peter', 1)
bill = new Player('Bill', 2) 
g.placeStone peter, 1, 1
# printBoard g 
