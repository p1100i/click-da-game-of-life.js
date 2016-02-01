var
  AppControllerFactoryConstructor;

AppControllerFactoryConstructor = function AppControllerFactoryConstructor(app) {
  app.controller('appController', ['$rootScope', '$scope', '$window', 'angular', 'Grid', 'Vec2', 'paper', function AppControllerFactory($rootScope, $scope, $window, angular, Grid, Vec2, paper) {
    var
      updater,
      timediff,
      timeoutId,
      timeupdate,
      lastTimestamp,
      lastIteratedTimestamp,
      viewSize,

      windowSizeVec     = new Vec2(),
      gridDimensions    = new Vec2(),
      canvas            = document.getElementById('paper-canvas'),
      grid              = new Grid(),
      cells             = grid.getCells(),
      drawnCells        = [],
      CELL_SIZE         = new Vec2(10, 10),
      HALF_CELL_SIZE    = CELL_SIZE.divide(2, true),
      PAGE_OFFSET       = new Vec2(50, 50),
      TIME_UNIT         = 50,
      ITERATE_TIME_UNIT = 200,

      STARTING_CELLS = [
        [32, 32],
        [32, 33],
        [33, 32],
        [33, 33],
        [35, 31],
        [35, 32],
        [35, 33]
      ],

      setMagic = function setMagic() {
        $rootScope.$broadcast('magic');
      },

      setDebug = function setDebug() {
        $rootScope.$broadcast('debug');
      },

      createRectangle = function createRectangle(x, y, sizeX, sizeY, offsetX, offsetY) {
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        var
          begPoint  = new paper.Point(x + offsetX, y + offsetY),
          endPoint  = new paper.Point(x + sizeX - offsetX, y + sizeY - offsetY);

        return new paper.Rectangle(begPoint, endPoint);
      },

      createDrawnObject = function createDrawnObject(size, fillColor, strokeColor) {
        var
          rect = createRectangle(0, 0, size.x, size.y, 1, 1),
          path = new paper.Path.Rectangle(rect);

        if (strokeColor) {
          path.strokeColor = strokeColor;
        }

        if (fillColor) {
          path.fillColor = fillColor;
        }

        return {
          'path' : path
        };
      },

      setDrawnObject = function setDrawnObject(object, position, positionScale, offset) {
        var
          path  = object.path;

        path.position.x = position.x;
        path.position.y = position.y;

        if (positionScale) {
          path.position.x *= positionScale.x;
          path.position.y *= positionScale.y;
        }

        if (offset) {
          path.position.x += offset.x;
          path.position.y += offset.y;
        }
      },

      spawnDrawnObjects = function spawnDrawnObjects(drawnObjects, objectCount, fillColor, strokeColor) {
        var
          i,
          path,
          drawnObject,
          length  = drawnObjects.length,
          diff    = objectCount - length;

        if (diff > 0) {
          while (diff--) {
            drawnObject = createDrawnObject(CELL_SIZE, fillColor, strokeColor);
            drawnObjects.push(drawnObject);
          }
        }

        for (i = 0; i < length; i++) {
          path          = drawnObjects[i].path;
          path.visible  = i < objectCount;
        }
      },

      drawCells = function drawCells() {
        var
          i,
          key,
          cell,
          drawnCell;

        i = 0;
        spawnDrawnObjects(drawnCells, Object.keys(cells).length, 'green', undefined, true);

        for (key in cells) {
          cell      = cells[key];
          drawnCell = drawnCells[i];
          setDrawnObject(drawnCell, cell, CELL_SIZE, HALF_CELL_SIZE);
          i++;
        }
      },

      redraw = function redraw(redrawGrid) {
        drawCells();

        paper.view.draw();
      },

      requestUpdate = function requestUpdate() {
        if (timeoutId) {
          $window.clearTimeout(timeoutId);
        }

        $window.requestAnimationFrame(updater);
      },

      iterate = function iterate(timestamp) {
        lastIteratedTimestamp = lastIteratedTimestamp || timestamp;

        var
          diff = timestamp - lastIteratedTimestamp ;

        if (diff > ITERATE_TIME_UNIT) {
          grid.iterate();
          lastIteratedTimestamp = timestamp;
        }
      },

      update = function update(timestamp) {
        lastTimestamp = lastTimestamp || timestamp;
        timediff      = timestamp - lastTimestamp;
        timeupdate    = Math.max(0, TIME_UNIT - timediff);

        iterate(timestamp);
        redraw();

        timeoutId     = $window.setTimeout(requestUpdate, timeupdate);
        lastTimestamp = timestamp + timeupdate;
      },

      setPaperSize = function setPaperSize($event) {
        gridDimensions.set($window.innerWidth - PAGE_OFFSET.x, $window.innerHeight - PAGE_OFFSET.y);
        gridDimensions.divide(CELL_SIZE);

        gridDimensions.x  = Math.floor(gridDimensions.x);
        gridDimensions.y  = Math.floor(gridDimensions.y);

        windowSizeVec.set(CELL_SIZE);
        windowSizeVec.multiply(gridDimensions);

        if (viewSize) {
          // Unfortunetely this is needed, as on resize a new Size vector gets reassigned to the view.
          viewSize        = paper.view.viewSize;
          viewSize.width  = windowSizeVec.x;
          viewSize.height = windowSizeVec.y;
        } else {
          viewSize = paper.view.viewSize = new paper.Size(windowSizeVec.x, windowSizeVec.y);
        }

        redraw();
      },

      populate = function populate(cells) {
        var
          i,
          cell;

        for (i = 0; i < cells.length; i++) {
          cell = cells[i];

          grid.setCell(cell[0], cell[1], 1);
        }
      },

      onMouseMove = function onMouseMove($event) {
        // console.log($event.target);
        // console.log(angular.element($event.target).offset());
      },

      init = function init() {
        updater = update;
        paper.setup(canvas);

        populate(STARTING_CELLS);
        setPaperSize();

        requestUpdate();

        angular.element($window).bind('resize', setPaperSize);

        $scope.onMouseMove  = onMouseMove;
        $scope.setMagic     = setMagic;
        $scope.setDebug     = setDebug;
        $scope.ready        = true;
      };

    init();
  }]);
};

module.exports = AppControllerFactoryConstructor;
