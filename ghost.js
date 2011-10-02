(function() {
  /*
  This file contains game logic which may be used on the client OR server.
  In MVC, these classes are models.
  
  NOTE: The coordinate system used for the board is inverted across the x-axis
  with the origin in the top right.
  */
  var DIRS, EMPTY, Game, Pathfinder, Player, pointInPolygon, printBoard, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ = require('underscore');
  DIRS = ['W', 'N', 'E', 'S'];
  EMPTY = -1;
  pointInPolygon = __bind(function(poly, x, y) {
    var pointsToLeft, pointsToRight;
    pointsToLeft = _.filter(poly, function(p) {
      return p.x < x && p.y === y;
    }).length;
    pointsToRight = _.filter(poly, function(p) {
      return p.x > x && p.y === y;
    }).length;
    return pointsToRight % 2 === 1 && pointsToRight % 2 === 1;
  }, this);
  Player = (function() {
    function Player(name, id, score) {
      this.name = name;
      this.id = id;
      this.score = score;
    }
    return Player;
  })();
  Pathfinder = (function() {
    function Pathfinder(x, y, direction) {
      this.x = x;
      this.y = y;
      this.direction = direction;
      this.pointAtPosition = __bind(this.pointAtPosition, this);
      this.atStart = __bind(this.atStart, this);
      this.position = __bind(this.position, this);
      this.move = __bind(this.move, this);
      this.turnAround = __bind(this.turnAround, this);
      this.turnRight = __bind(this.turnRight, this);
      this.path = [];
      this.turnLeft = (__bind(function() {
        var revDirs;
        revDirs = DIRS.slice().reverse();
        return __bind(function() {
          var dir;
          dir = revDirs.indexOf(this.direction);
          dir = (dir + 1) % 4;
          this.direction = revDirs[dir];
          return this;
        }, this);
      }, this))();
    }
    Pathfinder.prototype.turnRight = function() {
      var dir;
      dir = DIRS.indexOf(this.direction);
      dir = (dir + 1) % 4;
      this.direction = DIRS[dir];
      return this;
    };
    Pathfinder.prototype.turnAround = function() {
      var dir;
      dir = DIRS.indexOf(this.direction);
      dir = (dir + 2) % 4;
      this.direction = DIRS[dir];
      return this;
    };
    Pathfinder.prototype.move = function() {
      this.path.push(this.position());
      switch (this.direction) {
        case 'E':
          this.x++;
          break;
        case 'S':
          this.y++;
          break;
        case 'W':
          this.x--;
          break;
        case 'N':
          this.y--;
      }
      return this;
    };
    Pathfinder.prototype.front = function() {
      switch (this.direction) {
        case 'E':
          return {
            x: this.x + 1,
            y: this.y
          };
        case 'S':
          return {
            x: this.x,
            y: this.y + 1
          };
        case 'W':
          return {
            x: this.x - 1,
            y: this.y
          };
        case 'N':
          return {
            x: this.x,
            y: this.y - 1
          };
      }
    };
    Pathfinder.prototype.right = function() {
      switch (this.direction) {
        case 'E':
          return {
            x: this.x,
            y: this.y + 1
          };
        case 'S':
          return {
            x: this.x - 1,
            y: this.y
          };
        case 'W':
          return {
            x: this.x,
            y: this.y - 1
          };
        case 'N':
          return {
            x: this.x + 1,
            y: this.y
          };
      }
    };
    Pathfinder.prototype.left = function() {
      switch (this.direction) {
        case 'E':
          return {
            x: this.x,
            y: this.y - 1
          };
        case 'S':
          return {
            x: this.x + 1,
            y: this.y
          };
        case 'W':
          return {
            x: this.x,
            y: this.y + 1
          };
        case 'N':
          return {
            x: this.x - 1,
            y: this.y
          };
      }
    };
    Pathfinder.prototype.position = function() {
      return {
        x: this.x,
        y: this.y
      };
    };
    Pathfinder.prototype.atStart = function() {
      return _.isEqual(this.path[0], this.position());
    };
    Pathfinder.prototype.pointAtPosition = function(p) {
      return p.x === this.x && p.y === this.y;
    };
    return Pathfinder;
  })();
  Game = (function() {
    function Game(height, width) {
      var num, numa;
      this.height = height;
      this.width = width;
      this.checkWinner = __bind(this.checkWinner, this);
      this.addPlayer = __bind(this.addPlayer, this);
      this.innerPaths = __bind(this.innerPaths, this);
      this.onBoard = __bind(this.onBoard, this);
      this.placeStone = __bind(this.placeStone, this);
      this.board = (function() {
        var _results;
        _results = [];
        for (num = 1; 1 <= height ? num <= height : num >= height; 1 <= height ? num++ : num--) {
          _results.push((function() {
            var _results2;
            _results2 = [];
            for (numa = 1; 1 <= width ? numa <= width : numa >= width; 1 <= width ? numa++ : numa--) {
              _results2.push(EMPTY);
            }
            return _results2;
          })());
        }
        return _results;
      })();
      this.players = [];
    }
    Game.prototype.placeStone = function(player, x, y) {
      var p, toFill, _i, _len;
      if (x < this.width && y < this.height && this.board[x][y] === EMPTY) {
        this.board[x][y] = player.id;
        toFill = this.innerPaths(x, y);
        for (_i = 0, _len = toFill.length; _i < _len; _i++) {
          p = toFill[_i];
          this.fill(p, player.id);
        }
        player.score = _.select(_.flatten(this.board), function(id) {
          return id === player.id;
        }).length;
        return true;
      } else {
        return false;
      }
    };
    Game.prototype.onBoard = function(x, y) {
      return x < this.width && x >= 0 && y < this.height && y >= 0;
    };
    Game.prototype.innerPaths = function(lastX, lastY) {
      var front, i, lastPlayer, left, paths, pf, right, s, starts, _len;
      paths = [];
      starts = [
        {
          x: lastX,
          y: lastY + 1,
          d: 'W'
        }, {
          x: lastX - 1,
          y: lastY,
          d: 'N'
        }, {
          x: lastX,
          y: lastY - 1,
          d: 'E'
        }, {
          x: lastX + 1,
          y: lastY,
          d: 'S'
        }
      ];
      lastPlayer = this.board[lastX][lastY];
      for (i = 0, _len = starts.length; i < _len; i++) {
        s = starts[i];
        if (this.onBoard(s.x, s.y) && this.board[s.x][s.y] !== lastPlayer) {
          pf = new Pathfinder(s.x, s.y, s.d);
          front = pf.front();
          right = pf.right();
          left = pf.left();
          while (!pf.atStart() || pf.path.length < 2) {
            if (!this.onBoard(right.x, right.y) || !this.onBoard(front.x, front.y)) {
              pf.hitEdge = true;
              break;
            }
            if (this.board[right.x][right.y] !== lastPlayer) {
              pf.turnRight();
            } else if (this.onBoard(front.x, front.y) && this.board[front.x][front.y] !== lastPlayer) {} else if (this.onBoard(left.x, left.y) && this.board[left.x][left.y] !== lastPlayer) {
              pf.turnLeft();
            } else {
              pf.turnAround();
            }
            front = pf.front();
            if (this.board[front.x][front.y] === lastPlayer) {
              pf.path.push(pf.position());
            } else if (this.onBoard(front.x, front.y)) {
              pf.move();
            }
            front = pf.front();
            right = pf.right();
            left = pf.left();
          }
          if (!pf.hitEdge && pf.atStart()) {
            if (!pointInPolygon(pf.path, lastX, lastY) && pf.path.length > 0) {
              paths.push(pf.path);
            }
          }
        }
      }
      return paths;
    };
    Game.prototype.fill = function(path, playerID) {
      var groups, p, x, xGroup, y, _i, _len, _results;
      groups = _.groupBy(path, function(p) {
        return p.x;
      });
      for (_i = 0, _len = path.length; _i < _len; _i++) {
        p = path[_i];
        this.board[p.x][p.y] = playerID;
      }
      _results = [];
      for (x in groups) {
        xGroup = groups[x];
        _results.push((function() {
          var _ref, _ref2, _results2;
          _results2 = [];
          for (y = _ref = _.min(xGroup), _ref2 = _.max(xGroup); _ref <= _ref2 ? y <= _ref2 : y >= _ref2; _ref <= _ref2 ? y++ : y--) {
            _results2.push(pointInPolygon(path, x, y) ? this.board[x][y] = playerID : void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    Game.prototype.addPlayer = function(name, id) {
      var player;
      player = new Player(name, id, 0);
      this.players.push(player);
      return player;
    };
    Game.prototype.checkWinner = function() {
      return _.max(this.players, function(p) {
        return p.score;
      });
    };
    return Game;
  })();
  printBoard = function(g) {
    var colNum, row, s, _i, _len, _ref, _ref2;
    console.log('================================');
    s = '';
    for (colNum = 0, _ref = g.board[0].length - 1; 0 <= _ref ? colNum <= _ref : colNum >= _ref; 0 <= _ref ? colNum++ : colNum--) {
      s = '';
      _ref2 = g.board;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        s += row[colNum];
        s += ' ';
      }
      console.log(s);
    }
    return console.log('================================');
  };
  exports.Game = Game;
  exports.Player = Player;
  exports.printBoard = printBoard;
}).call(this);
