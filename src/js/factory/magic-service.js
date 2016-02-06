var
  MagicServiceFactoryConstructor;

MagicServiceFactoryConstructor = function MagicServiceFactoryConstructor(app) {
  app.factory('magicService', [function () {
    var
      divideElement = function divideElement(array, number) {
        var
          len = array.length;

        while (len--) {
          array[len] /= number;
        }

        return array;
      };

    return {
      'divideElement' : divideElement
    };
  }]);
};

module.exports = MagicServiceFactoryConstructor;
