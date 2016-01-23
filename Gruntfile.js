var
  run = function run(grunt) {
    grunt.initConfig({
      'clean': {
        'precompiled' : ['build/precompiled/**/*'],
        'compiled'    : ['build/compiled/**/*'],
        'minified'    : ['build/minified/**/*']
      },

      'symlink' : {
        'src' : {
          'dest'        : 'node_modules/src',
          'relativeSrc' : '../src/js'
        },

        'app' : {
          'dest'        : 'node_modules/app',
          'relativeSrc' : '..'
        }
      },

      'jasmine-npm-node' : {
        'all' : {}
      },

      'browserify' : {
        'build/precompiled/js/app.js' : ['build/target/target.js']
      },

      'copy' : {
        'view' : {
          'expand'  : true,
          'cwd'     : 'src/html/view/',
          'src'     : '**/*',
          'dest'    : 'build/compiled/'
        },
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
            'build/minified/js/app.js': 'build/compiled/js/app.js'
          }
        }
      },

      'concat': {
        'options': {
          'separator': ';'
        },

        'compiled' : {
          'files': {
            'build/compiled/js/app.js': 'build/precompiled/js/app.js'
          }
        }
      },

      'gh-pages': {
        'options': {
          'base': 'build/minified'
        },

        'src': ['**/*']
      }
    });

    grunt.loadTasks('./task');

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-symlink');

    grunt.registerTask('setup', [
      'symlink',
    ]);

    grunt.registerTask('validate:build', [
      'jasmine-npm-node'
    ]);

    grunt.registerTask('compile', [
      'clean:precompiled',
      'clean:compiled',
      'browserify',
      'concat:compiled',
      'copy'
    ]);

    grunt.registerTask('minify', [
      'clean:minified',
      'uglify:minified',
      'htmlmin:minified'
    ]);

    grunt.registerTask('build:dev', [
      'validate:build',
      'compile'
    ]);

    grunt.registerTask('build', [
      'build:dev',
      'minify'
      // TODO
      // 'md5'
    ]);

    grunt.registerTask('default', [
      'build'
    ]);
  };

module.exports = run;
