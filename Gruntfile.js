var
  _ = require('lodash'),

  run = function run(grunt) {
    grunt.initConfig({
      'pkg' : grunt.file.readJSON('package.json'),

      'jasmine_nodejs' : {
        'all' : {
          'specs' : [
            'test/**/*'
          ]
        }
      },

      'jshint': {
        'options': {
          'browser'     : true,
          'curly'       : true,
          'eqeqeq'      : true,
          'eqnull'      : true,
          'latedef'     : true,
          'newcap'      : true,
          'node'        : true,
          'nonew'       : true,
          'nonbsp'      : true,
          'quotmark'    : 'single',
          'undef'       : true,
          'debug'       : true,
          'indent'      : 2
        },

        'unused' : {
          'options' : {
            'noempty' : true,
            'unused'  : 'vars'
          },

          'files' : {
            'src' : 'src/js/**/*'
          }
        },

        'default' : 'src/js/**/*'
      },

      'jscs' : {
        'options' : {
          'disallowTrailingWhitespace'            : true,
          'disallowTrailingComma'                 : true,
          'disallowFunctionDeclarations'          : true,
          'disallowNewlineBeforeBlockStatements'  : true,
          'disallowMixedSpacesAndTabs'            : true,
          'requireDotNotation'                    : true,
          'requireMultipleVarDecl'                : true,
          'requireSpaceAfterKeywords'             : true,
          'requireSpaceBeforeBlockStatements'     : true,
          'requireSpacesInConditionalExpression'  : true,
          'requireCurlyBraces'                    : true,
          'disallowKeywordsOnNewLine'             : ['else'],
          'validateIndentation'                   : 2,
          'requireSpacesInFunction' : {
            'beforeOpeningCurlyBrace' : true
          }
        },

        'default' : 'src/js/**/*'
      },

      'clean': {
        'precompiled' : ['build/precompiled/**/*'],
        'compiled'    : ['build/compiled/**/*'],
        'minified'    : ['build/minified/**/*']
      },

      'browserify' : {
        'build/precompiled/js/app.js' : ['build/target/target.js']
      },

      'copy' : {
        'asset_compiled' : {
          'expand'  : true,
          'cwd'     : 'asset/',
          'src'     : '**/*',
          'dest'    : 'build/compiled/'
        },

        'asset_minified' : {
          'expand'  : true,
          'cwd'     : 'asset/',
          'src'     : '**/*',
          'dest'    : 'build/minified/'
        },

        'view' : {
          'expand'  : true,
          'cwd'     : 'src/html/view',
          'src'     : '**/*',
          'dest'    : 'build/compiled'
        }
      },

      'htmlmin': {
        'minified': {
          'options': {
            'removeComments': true,
            'collapseWhitespace': true
          },

          'files': {
            'build/minified/index.html': 'build/compiled/index.html'
          }
        }
      },

      'uglify': {
        'minified': {
          'options' : {
            'drop_console': true
          },

          'files': {
            'build/minified/js/app.js': ['build/compiled/js/template.js', 'build/compiled/js/app.js']
          }
        }
      },

      'concat': {
        'options': {
          'separator': ';'
        },

        'compiled' : {
          'files': {
            'build/compiled/js/app.js': ['build/precompiled/js/template.js', 'build/precompiled/js/app.js']
          }
        }
      },

      'gh-pages': {
        'options': {
          'base': 'build/minified',
          'user': {
            'name': '<%= pkg.author.name %>',
            'email': '<%= pkg.author.email %>'
          }
        },

        'src': ['**/*']
      },

      // Stylus minifier/exporter.
      'stylus' : {
        'options' : {
          // Use import statements on css as copy inclusion.
          'include css' : true,
          'compress'    : false
        },

        'compiled' : {
          'files' : {
            'build/compiled/css/app.css' : ['src/styl/main.styl']
          }
        }
      },

      'cssmin': {
        'options': {
          'shorthandCompacting': false,
          'roundingPrecision': -1
        },

        'minified': {
          'files': {
            'build/minified/css/app.css': ['build/compiled/css/app.css']
          }
        }
      },

      'bower' : {
        'install' : {
          'options' : {
            'copy' : false
          }
        }
      },

      // If angular is used template can be compiled for it.
      'ngtemplates' : {
        'default' : {
          'cwd'         : 'src/html/template',
          'src'         : '**/*.html',
          'dest'        : 'build/precompiled/js/template.js',
          'options'     : {
            'bootstrap': function (module, script) {
              // This predefines a function which will populate the angular
              // cache with the template HTML. Check out the generated
              // template.js under the build directory, you'll need to call
              // it with your angular app instance.
              return 'window.angularTemplates = function angularTemplates(app) { app.run([\'$templateCache\', function ($templateCache) { ' + script + ' } ]) };';
            },

            // Reference existing task.
            // htmlmin:  '<%= htmlmin.app %>'
            'htmlmin' : {
              'collapseWhitespace'        : true,
              'collapseBooleanAttributes' : true
            }
          }
        }
      },

      // Concats bower components into a file.
      'bower_concat' : {
        'compiled' : {
          'dest' : 'build/compiled/js/libs.js',
        },

        'minified' : {
          // Special callback for defining built files general.
          // In this case we want bower concat to use the minified builds.
          'callback' : function callback(mainFiles, component) {
            return _.map(mainFiles, function (filepath) {
              var minPath;

              minPath = filepath.replace(/\.js$/, '.min.js');

              if (grunt.file.exists(minPath)) {
                return minPath;
              }

              minPath = filepath.replace(/\.js$/, '-nodebug-jsmin.js');

              if (grunt.file.exists(minPath)) {
                return minPath;
              }

              return filepath;
            });
          },

          'dest' : 'build/minified/js/libs.js'
        }
      },

      'md5symlink': {
        'options' : {
          'patterns' : ['.js', '.css']
        },

        'compiled': {
          'src': 'build/compiled/**/*',
          'dest': 'build/compiled/'
        },

        'minified': {
          'src': 'build/minified/**/*',
          'dest': 'build/minified/'
        }
      },

      'symlinkassets': {
        'compiled': {
          'root'    : 'compiled',
          'src'     : 'build/compiled/**/*',
          'dest'    : 'build/compiled/'
        },

        'minified': {
          'root'    : 'minified',
          'src'     : 'build/minified/**/*',
          'dest'    : 'build/minified/'
        }
      },

      'watch' : {
        'options' : {
          'spawn'         : false,
          'maxListeners'  : 99
        },

        'js' : {
          'files' : ['src/js/**/*.js', 'test/spec/**/*.js'],
          'tasks' : ['validate:build', 'browserify', 'concat:compiled']
        },

        'html' : {
          'files' : ['src/html/**/*.html'],
          'tasks' : ['ngtemplates', 'concat:compiled', 'copy:view']
        },

        'styl' : {
          'files' : ['src/styl/**/*'],
          'tasks' : ['stylus:compiled']
        },

        'asset' : {
          'files' : ['asset/**/*'],
          'tasks' : ['copy:asset_compiled', 'copy:asset_minified']
        }
      }
    });

    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-md5symlink');
    grunt.loadNpmTasks('grunt-symlinkassets');
    grunt.loadNpmTasks('grunt-jasmine-nodejs');

    grunt.registerTask('setup', [
      'bower'
    ]);

    grunt.registerTask('validate:build', [
      'jshint:default',
      'jasmine_nodejs'
    ]);

    grunt.registerTask('validate:all', [
      'validate:build',
      'jshint:unused',
      'jscs'
    ]);

    grunt.registerTask('compile', [
      'clean:precompiled',
      'clean:compiled',
      'bower_concat:compiled',
      'browserify',
      'ngtemplates',
      'concat:compiled',
      'stylus:compiled',
      'copy:view',
      'copy:asset_compiled'
    ]);

    grunt.registerTask('minify', [
      'clean:minified',
      'bower_concat:minified',
      'uglify:minified',
      'htmlmin:minified',
      'cssmin:minified',
      'copy:asset_minified'
    ]);

    grunt.registerTask('build:dev', [
      'validate:build',
      'compile'
    ]);

    grunt.registerTask('dev', [
      'clean',
      'build:dev',
      'watch'
    ]);

    grunt.registerTask('test', [
      'validate:all'
    ]);

    grunt.registerTask('md5', [
      'md5symlink',
      'symlinkassets'
    ]);

    grunt.registerTask('build', [
      'build:dev',
      'minify',
      'md5'
    ]);

    grunt.registerTask('default', [
      'setup',
      'build'
    ]);
  };

module.exports = run;
