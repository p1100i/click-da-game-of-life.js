var
  Jasmine       = require('jasmine'),
  SpecReporter  = require('jasmine-spec-reporter'),
  jasmine       = new Jasmine(),
  noop          = function () {},

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
  };

module.exports = runJasmine;
