(function() {
  /*
  This file contains game logic which may be used on the client OR server.
  In MVC, these classes are models.
  
  NOTE: The coordinate system used for the board is inverted across the x-axis
  with the origin in the top right.
  */
  var DIRS, EMPTY, Game, Player, pointInPolygon, printBoard, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
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
  Game = (function() {
    function Game(height, width, gameoverRatio) {
      var num, numa, _ref;
      this.height = height;
      this.width = width;
      this.gameoverRatio = gameoverRatio;
      this.checkGameOver = __bind(this.checkGameOver, this);
      this.checkWinner = __bind(this.checkWinner, this);
      this.addPlayer = __bind(this.addPlayer, this);
      this.placeStones = __bind(this.placeStones, this);
      this.setEmpty = __bind(this.setEmpty, this);
      this.floodFill = __bind(this.floodFill, this);
      this.onBoard = __bind(this.onBoard, this);
      if ((_ref = this.gameoverRatio) == null) {
        this.gameoverRatio = .8;
      }
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
    Game.prototype.onBoard = function(x, y) {
      return x < this.width && x >= 0 && y < this.height && y >= 0;
    };
    Game.prototype.floodFill = function(x, y, replacement) {
      var between, e, flooded, n, q, w, x, xy, _i, _len;
      flooded = [];
      q = [];
      if ((!(this.board[x] != null)) || this.board[x][y] !== EMPTY) {
        return flooded;
      }
      q.push([x, y]);
      while (q.length > 0) {
        n = w = e = q.pop();
        if ((this.board[n[0]] != null) && this.board[n[0]][n[1]] === EMPTY) {
          while ((this.board[w[0]] != null) && this.board[w[0]][w[1]] === EMPTY) {
            w = [w[0] - 1, w[1]];
          }
          while ((this.board[e[0]] != null) && this.board[e[0]][e[1]] === EMPTY) {
            e = [e[0] + 1, e[1]];
          }
          if (!_.isEqual(w, e)) {
            between = (function() {
              var _ref, _ref2, _results;
              _results = [];
              for (x = _ref = w[0] + 1, _ref2 = e[0] - 1; _ref <= _ref2 ? x <= _ref2 : x >= _ref2; _ref <= _ref2 ? x++ : x--) {
                _results.push([x, n[1]]);
              }
              return _results;
            })();
          }
          if (between != null) {
            for (_i = 0, _len = between.length; _i < _len; _i++) {
              xy = between[_i];
              this.board[xy[0]][xy[1]] = replacement;
            }
            flooded = flooded.concat(between);
            q = q.concat((function() {
              var _j, _len2, _ref, _results;
              _results = [];
              for (_j = 0, _len2 = between.length; _j < _len2; _j++) {
                xy = between[_j];
                if (((_ref = this.board[xy[0]]) != null ? _ref[xy[1] - 1] : void 0) === EMPTY) {
                  _results.push([xy[0], xy[1] - 1]);
                }
              }
              return _results;
            }).call(this));
            q = q.concat((function() {
              var _j, _len2, _ref, _results;
              _results = [];
              for (_j = 0, _len2 = between.length; _j < _len2; _j++) {
                xy = between[_j];
                if (((_ref = this.board[xy[0]]) != null ? _ref[xy[1] + 1] : void 0) === EMPTY) {
                  _results.push([xy[0], xy[1] + 1]);
                }
              }
              return _results;
            }).call(this));
          }
        }
      }
      return flooded;
    };
    Game.prototype.neighbors = function(xy) {
      var x, y;
      x = xy[0];
      y = xy[1];
      return [[x + 1, y], [x - 1, y], [x, y - 1], [x, y + 1]];
    };
    Game.prototype.setEmpty = function(points) {
      var xy, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        xy = points[_i];
        _results.push(this.board[xy[0]][xy[1]] = EMPTY);
      }
      return _results;
    };
    Game.prototype.placeStones = function(player, stones) {
      var didFlood, flooded, n, neighbors, x, xy, y, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4;
      _.map(stones, __bind(function(s) {
        return this.board[s[0]][s[1]] = player.id;
      }, this));
      neighbors = (_ref = []).concat.apply(_ref, _.map(stones, this.neighbors));
      didFlood = false;
      for (_i = 0, _len = neighbors.length; _i < _len; _i++) {
        _ref2 = neighbors[_i], x = _ref2[0], y = _ref2[1];
        flooded = this.floodFill(x, y, player.id);
        for (_j = 0, _len2 = flooded.length; _j < _len2; _j++) {
          xy = flooded[_j];
          if (!(xy != null)) {
            continue;
          }
          _ref3 = this.neighbors(xy);
          for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
            n = _ref3[_k];
            if (((_ref4 = this.board[n[0]]) != null ? _ref4[n[1]] : void 0) !== player.id) {
              this.setEmpty(flooded);
              flooded = [];
            }
          }
        }
        if (flooded.length > 0) {
          didFlood = true;
        }
        neighbors = _.without.apply(_, [neighbors].concat(__slice.call(flooded)));
      }
      if (!didFlood) {
        this.setEmpty(stones);
      }
      return didFlood;
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
    Game.prototype.checkGameOver = function() {
      return _.without(_.flatten(this.board), EMPTY).length < this.height * this.width * this.gameoverRatio;
    };
    return Game;
  })();
  printBoard = function(board) {
    var colNum, row, s, _i, _len, _ref;
    console.log('================================');
    s = '';
    for (colNum = 0, _ref = board[0].length - 1; 0 <= _ref ? colNum <= _ref : colNum >= _ref; 0 <= _ref ? colNum++ : colNum--) {
      s = '';
      for (_i = 0, _len = board.length; _i < _len; _i++) {
        row = board[_i];
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
