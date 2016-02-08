var
  grunt,
  Jasmine       = require('jasmine'),
  SpecReporter  = require('jasmine-spec-reporter'),
  jasmine       = new Jasmine(),

  runJasmine = function runJasmine(options) {
    var
      onComplete;

    jasmine.loadConfig({
        spec_dir: 'test/spec',
        spec_files: [
            '**/*.spec.js'
        ]
    });

    if (options && options.onComplete) {
      jasmine.onComplete(options.onComplete);
    }

    jasmine.addReporter(new SpecReporter());
    jasmine.execute();
  },

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
