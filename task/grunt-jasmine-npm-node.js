var
  runJasmine = require('../tmp/run-jasmine'),
  grunt,

  run = function run(options) {
    var
      done = this.async();

    runJasmine({
      'onComplete' : function (result) {
        done(result);
      }
    });
  },

  exportTask = function exportTask(gruntObj) {
    grunt = gruntObj;

    grunt.registerMultiTask('jasmine-npm-node', 'Runs jasmine specs on node w/ the jasmine-npm package.', run);
  };

module.exports = exportTask;
