var
  html = document.getElementsByTagName('html')[0],

  loadCounter = 0,


  libs        = {},
  libDefs     = {},
  directives  = [],

  constants = [
    require('./constant/route-config')
  ],

  factories = [
    require('./factory/magic-service')
  ],

  controllers = [
    require('src/controller/app-controller'),
    require('src/controller/game-controller')
  ],

  angularComponents = [
    constants,
    directives,
    factories,
    controllers
  ],

  loadAngularTemplates = function loadAngularTemplates(angularApp) {
    // Grunt task ngtemplates precompiles all the angular templates,
    // and defines the windowfunction .angularTemplates which loader.js
    // cascades for this file. This is how templates can be included
    // in the fastest way through compile time.
    libs.angularTemplates(angularApp);
  },

  loadAngularLib = function loadAngularLib(angularApp, libName, lib) {
    angularApp.factory(libName, [function () {
      return lib;
    }]);
  },

  loadAngularLibs = function loadAngularLibs(angularApp) {
    var
      libName;

    for (libName in libs) {
      loadAngularLib(angularApp, libName, libs[libName]);
    }
  },

  loadAngularComponents = function loadAngularComponents(angularApp) {
    var
      i,
      j,
      components;

    for (i = 0; i < angularComponents.length; i++) {
      components = angularComponents[i];

      for (j = 0; j < components.length; j++) {
        components[j](angularApp);
      }
    }
  },

  loadAngularRoutes = function loadAngularRoutes(angularApp) {
    angularApp.config(['$routeProvider', 'routeConfig', function ($routeProvider, routeConfig) {
      var
        i,
        path,
        paths,
        controller,
        route,
        routes = routeConfig.routes;

      for (controller in routes) {
        route = routes[controller];
        paths = route.paths;

        for (i = 0; i < paths.length; i++) {
          path = paths[i];

          $routeProvider.when(path, {
            'controller'  : controller,
            'templateUrl' : route.templateUrl
          });
        }
      }

      $routeProvider.otherwise({
        redirectTo : '/'
      });
    }]);
  },

  configAngular = function configAngular(angularApp) {
    angularApp.config(['$httpProvider', function ($httpProvider) {
      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }]);
  },

  loadLibs = function loadLibs() {
    var
      lib,
      libDef,
      libName;

    for (libName in libDefs) {
      libDef = libDefs[libName];
      lib    = libDef.libObject || window[libDef.globalName];

      if (lib) {
        libDef.loaded = true;
        libs[libName] = lib;
      } else {
        libDef.loaded = false;
        return false;
      }
    }

    return true;
  },

  defineLib = function defineLib(name, globalName, object, noop) {
    if (noop) {
      window[globalName] = function () {};
    }

    var
      libDef = { 'libName' : name };

    if (globalName) {
      libDef.globalName = globalName;
    }

    if (object) {
      libDef.libObject = object;
    }

    libDefs[name] = libDef;
  },

  defineLibs = function defineLibs() {
    defineLib('paper',            'paper'                                   );
    defineLib('angular',          'angular'                                 );
    defineLib('angularTemplates', 'angularTemplates'                        );
    defineLib('MyHelper',         undefined,          require('my-helper')  );
    defineLib('Grid',             undefined,          require('src/grid')   );
    defineLib('Vec2',             undefined,          require('vec2')       );
  },

  init = function init() {
    defineLibs();

    // Ensure libs are truly loaded.
    if (!loadLibs()) {
      loadCounter++;

      if (loadCounter > 10) {
        console.error('Can not load libs', JSON.stringify(libDefs, 0, 2));
        throw new Error('LIB_NOT_AVAILABLE');
      }

      setTimeout(init, 50);
      return;
    }

    var
      angularApp = libs.angular.module('app', ['ngRoute', 'ngCookies']);

    loadAngularLibs(angularApp);
    loadAngularComponents(angularApp);
    loadAngularTemplates(angularApp);
    loadAngularRoutes(angularApp);

    configAngular(angularApp);

    // angularApp.run(['$rootScope', setRootScope]);
    // Bootstrap the app, after this, there is no option for app modification.
    libs.angular.bootstrap(html, ['app']);
  };

window.onload = init;
