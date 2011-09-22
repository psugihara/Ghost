# This file contains game logic which may be used on the client OR server.
# In MVC, these classes are models.


DIRS = ['E', 'S', 'W', 'N']
EMPTY = -1 # Never use -1 as a player id!

class Player
  constructor: (@name, @id, @score) ->


class Pathfinder
  constructor: (@x, @y, @direction) ->
    @turnRight = (=>
        dir = DIRS.indexOf @direction
        =>
          dir = (dir + 1) % 4
          @direction = DIRS[dir]
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

  frontRight: ->
    switch @direction
      when 'E' then x: @x+1, y: @y+1
      when 'S' then x: @x-1, y: @y+1
      when 'W' then x: @x-1, y: @y-1
      when 'N' then x: @x+1, y: @y-1

  position: ->
    {x: @x, y: @y}


class Game
  constructor: (@height, @width) ->
    @board = ((EMPTY for numa in [1..width]) for num in [1..height])

  placeStone: (player, x, y) =>
    if x < @width and y < @height and @board[x][y] == EMPTY
      # That spot is on the board and it's empty.
      @board[y][x] = player.id
      @checkBoard x, y
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
  checkBoard: (lastX, lastY) =>
    paths = []
    # We look for 'inner paths' by placing our left hand on the wall and
    # walking around. The wall is the last player's stones.
    starts = [
      x: lastX,     y: lastY - 1
      x: lastX - 1, y: lastY
      x: lastX + 1, y: lastY
      x: lastX,     y: lastY + 1
    ] # list of start positions for possible paths
    lastPlayer = @board[lastY][lastX]
    console.log 'hi'
    for s, i in starts
      if @board[s.y][s.x] != lastPlayer# and @board[s.y][s.x]?
        # Make a pathfinder and let it explore!
        pathfinder = new Pathfinder(s.x, s.y, DIRS[i])
        front = @board[pathfinder.front().y][pathfinder.front().x]
        frontRight = @board[pathfinder.frontRight().y][pathfinder.frontRight().x]
        right = @board[pathfinder.right().y][pathfinder.right().x]
        while pathfinder.position() != s
          console.log 'pos:'
          console.log pathfinder.position()
          console.log pathfinder.position()
          console.log 'start:'
          console.log s
          if front == lastPlayer or not front? or frontRight != lastPlayer
            console.log 'hey'
            pathfinder.turnRight()
          else
            console.log 'hi'
            pathfinder.move()

          front = @board[pathfinder.front().y][pathfinder.front().x]
          frontRight = @board[pathfinder.frontRight().y][pathfinder.frontRight().x]
          right = @board[pathfinder.right().y][pathfinder.right().x]
      s.visited = true

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
# printBoard g 
