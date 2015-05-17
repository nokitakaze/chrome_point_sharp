var vendorCopy = [
    'jquery/jquery.min.js',

    'fancybox/source/jquery.fancybox.pack.js',
    'fancybox/source/helpers/jquery.fancybox-media.js',
    'fancybox/source/jquery.fancybox.css',

    'markitup/markitup/jquery.markitup.js',
    'markitup/markitup/skins/markitup/style.css',

    'soundcloud/soundcloud.player.api.js'
].map(function(file) {
    return {
        src: 'vendor/' + file,
        dest: 'chrome_point_plus/vendor/' + file
    };
});

vendorCopy.push({
    expand: true,
    src: [ 
        'vendor/fancybox/source/*.png',
        'vendor/fancybox/source/*.gif'
    ],
    dest: 'chrome_point_plus/'
});

/* global module */
module.exports = function(grunt) {
    // Настройки
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Что копировать
        copy: {
            main: {
                files: vendorCopy
            }
        },
        bump: {
            options: {
                files: [ 'package.json', 'bower.json', 'chrome_point_plus/manifest.json' ],
                commit: true,
                commitMessage: 'Release %VERSION%',
                commitFiles: [ 'package.json', 'bower.json', 'chrome_point_plus/manifest.json' ],
                createTag: true,
                tagName: '%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: true
            }
        }
    });

    // Загрузить плагины
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-bump');

    // Что выполнять по команде `grunt`
    grunt.registerTask('default', [ 'copy' ]);
};