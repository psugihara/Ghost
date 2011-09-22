# This file contains game logic which may be used on the client OR server.
# In MVC, these classes are models.


DIRS = ['E', 'S', 'W', 'N']


class Player
  constructor: (@name, @id, @score) ->


class Pathfinder
  constructor: (@x, @y, @direction) ->

  turnLeft: (=>
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

  # Return inner paths adjacent to the last played stone.
  # So if X's are the last player's pieces,
  #    XXXX
  #   X012X
  #    XX3X
  #      X
  #   we'd return [[x0, y0], [x1, y1], [x2, y2], [x3, y3]].
  # Note: The path may contain positions where other players have played.
  checkBoard: (lastX, lastY) =>
    # We look for 'inner paths' by placing our left hand on the wall and
    # walking around. The wall is the last player's stones.
    starts = [
      x: lastX,     y: lastY - 1
      x: lastX - 1, y: lastY
      x: lastX + 1, y: lastY
      x: lastX,     y: lastY + 1
    ] # list of start positions for possible paths
    lastPlayer = @board[lastY][lastX]
    for s, i in starts
      if @board[s.y][s.x] != lastPlayer
        pathfinder = new Pathfinder(s.x, s.y, DIRS[i])
        front = pahfinder.front()
        while front != p
          console.log 'hey'
          if @board[front.y][front.x] == lastPlayer
            pathfinder.turnLeft()
          else
            pathfinder.move()
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
