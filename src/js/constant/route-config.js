var RouteConfigFactory = function RouteConfigFactory(app) {
  var
    routes = {},

    createEntityConfig = function createEntityConfig(controller, template, urls) {
      return {
        'controller'  : controller,
        'template'    : template,
        'urls'        : urls
      };
    },

    appendRoute = function appendRoute(controller, templateUrl, itemType, paths) {
      routes[controller] = {
        'controller'    : controller,
        'templateUrl'   : templateUrl,
        'itemType'      : itemType,
        'paths'         : paths
      };
    },

    appendRoutes = function appendRoutes(entitiesConfig) {
      var
        entity,
        entityConfig;

      for (entity in entitiesConfig) {
        entityConfig = entitiesConfig[entity];
        appendRoute(entityConfig.controller, entityConfig.template,  entity, entityConfig.urls);
      }
    },

    init = function init() {
      appendRoutes({
        'game' : createEntityConfig('gameController', 'game.html', ['/'])
      });
    };

  init();

  app.constant('routeConfig', {
    'routes' : routes
  });
};

module.exports = RouteConfigFactory;
