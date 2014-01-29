/* global module:false */

/**
 * Grunt file that handles managing tasks such as rendering
 * SASS, providing a basic HTTP server, building a
 * distribution, and deploying.
 */
module.exports = function(grunt) {
  var _ = grunt.util._;

  // Project configuration.  Many values are directly read from
  // package.json.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") + "\\n" %>' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= pkg.license || _.pluck(pkg.licenses, "type").join(", ") %> */' +
        '<%= "\\n\\n" %>'
    },

    // Clean up the distribution fold
    clean: {
      folder: 'dist/'
    },

    // JS Hint checks code for coding styles and possible errors
    jshint: {
      options: {
        curly: true,
        es3: true,
        forin: true,
        latedef: true,
        //maxlen: 80,
        indent: 2,
        multistr: true
      },
      files: ['Gruntfile.js', 'js/*.js']
    },

    // Compass is an extended SASS.  Set it up so that it generates to .tmp/
    compass: {
      options: {
        sassDir: 'styles',
        cssDir: '.tmp/css',
        generatedImagesDir: '.tmp/images',
        fontsDir: 'styles/fonts',
        imagesDir: 'images',
        javascriptsDir: 'js',
        importPath: 'bower_components',
        httpPath: './',
        relativeAssets: true
      },
      dist: {
        options: {
          environment: 'production',
          outputStyle: 'expanded',
          cssDir: '.tmp/css'
        }
      }
    },

    // Copy relevant files over to distribution
    copy: {
      images: {
        files: [
          {
            cwd: './images/',
            expand: true,
            src: ['**'],
            dest: 'dist/images/'
          }
        ]
      }
    },

    // Brings files toggether
    concat: {
      options: {
        separator: '\r\n\r\n'
      },
      // JS version
      js: {
        src: ['js/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      // CSS
      css: {
        src: ['.tmp/css/styles.css'],
        dest: 'dist/<%= pkg.name %>.css'
      },
      // Libs
      libs: {
        src: [
          'bower_components/jquery/jquery.min.js',
          'bower_components/underscore/underscore-min.js',
          'bower_components/tabletop/src/tabletop.js',
          'bower_components/momentjs/min/moment.min.js',
          'bower_components/isotope/jquery.isotope.min.js',
          'bower_components/eventEmitter/eventEmitter.min.js',
          'bower_components/eventie/eventie.js',
          'bower_components/imagesloaded/imagesloaded.js'
        ],
        dest: 'dist/<%= pkg.name %>.libs.js'
      }
    },

    // Replace some stuff
    replace: {
      imagePath: {
        src: ['dist/<%= pkg.name %>.css'],
        dest: 'dist/<%= pkg.name %>.css',
        replacements: [{
          from: "url('../../images",
          to: "url('./images"
        }]
      }
    },

    // Minify JS for network efficiency
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['dist/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    // Minify CSS for network efficiency
    cssmin: {
      options: {
        banner: '<%= meta.banner %>',
        report: true
      },
      css: {
        src: ['dist/<%= pkg.name %>.css'],
        dest: 'dist/<%= pkg.name %>.min.css'
      }
    },

    // HTTP Server
    connect: {
      server: {
        options: {
          port: 8888
        }
      }
    },

    // Watches files for changes and performs task
    watch: {
      files: ['<%= jshint.files %>', 'styles/*.scss'],
      tasks: 'watcher'
    }
  });

  // Load plugin tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-text-replace');


  // Default build task
  grunt.registerTask('default', ['jshint', 'compass:dist', 'clean', 'copy', 'concat', 'replace', 'cssmin', 'uglify']);

  // Server and watch
  grunt.registerTask('watcher', ['default']);
  grunt.registerTask('server', ['connect', 'watch']);
};
