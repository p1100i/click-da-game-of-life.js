var
  AppControllerFactoryConstructor;

AppControllerFactoryConstructor = function AppControllerFactoryConstructor(app) {
  app.controller('appController', ['$rootScope', '$scope', function AppControllerFactory($rootScope, $scope) {
    var
      setMagic = function setMagic() {
        $rootScope.$broadcast('magic');
      },

      setDebug = function setDebug() {
        $rootScope.$broadcast('debug');
      },

      init = function init() {
        $scope.setDebug = setDebug;
        $scope.setMagic = setMagic;
      };

    init();
  }]);
};

module.exports = AppControllerFactoryConstructor;
