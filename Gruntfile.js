module.exports = function(grunt) {

    // Initial Grunt conf
    var config = {
        pkg: grunt.file.readJSON('package.json'),

        "jsdoc-ng" : {
            dist : {
                src: ['./src/*.js'],
                dest: 'docs',
                template : 'jsdoc-ng',
                options: {
                }
            }
        }
    };


    /*
        Build conf for Uglify
            - Include more or less sources
    */
    function makeUglifyConfig(){
        var uglifyConf = {};
        var options = {
            compress: {
                drop_console: true
            },
            banner: '/* LD  v<%= pkg.version %> - Built on <%= grunt.template.today() %> */\n'
        };


        // Build with plugins
        uglifyConf.all = {
            options: options,
            files:{
                './build/ld-<%= pkg.version %>.min.js': ['./src/lightDom.js','./src/plugins/*.js']
            }
        };


        // Core only
        uglifyConf.noPlugin = {
            options: options,
            files: {
                './build/ld-<%= pkg.version %>.min.js': ['./src/lightDom.js']
            }
        };

        if( grunt.option('with_dollar_alias') ){
            for( var target in uglifyConf  ){
                for(var file in uglifyConf[target].files )
                    uglifyConf[target].files[file].push('./src/$_alias.js');
            }
        }

        return { uglify: uglifyConf };
    }


    grunt.util._.extend(config, makeUglifyConfig() );

    grunt.initConfig(config);


    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc-ng');


    grunt.registerTask('default',  [ 'uglify:all' ]);
    grunt.registerTask('noPlugin', [ 'uglify:noPlugin' ]);
};