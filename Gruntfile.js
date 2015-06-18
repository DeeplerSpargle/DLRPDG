module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
        //uglify: {
        //    options: {
        //        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        //    },
        //    build: {
        //        src: 'src/<%= pkg.name %>.js',
        //        dest: 'build/<%= pkg.name %>.min.js'
        //    }
        //}
        //browserify: {
        //
        //    bundle: {
        //        src: ['/node_modules/knockout/build/output/knockout-latest.js'],
        //        dest: 'public/js/lib/'
        //
        //    }
        //}
    });

    // Load the plugin that provides the "uglify" task.
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-browserify');

    // Default task(s).
    //grunt.registerTask('default', ['browserify']);

};