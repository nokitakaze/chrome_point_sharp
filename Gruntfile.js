var vendorCopy = [
    'jquery/jquery.min.js',

    'fancybox/source/jquery.fancybox.pack.js',
    'fancybox/source/helpers/jquery.fancybox-media.js',
    'fancybox/source/jquery.fancybox.css',

    'markitup/markitup/jquery.markitup.js',
    'markitup/markitup/skins/markitup/style.css'
].map(function(file) {
    return {
        src: 'vendor/' + file,
        dest: 'chrome_point_plus/vendor/' + file
    };
});

vendorCopy.push({
    expand: true,
    src: [ 'vendor/fancybox/source/*.png' ],
    dest: 'chrome_point_plus/'
});

module.exports = function(grunt) {

    // Настройки
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Что копировать
        copy: {
            main: {
                files: vendorCopy
            }
        }
    });

    // Загрузить плагины
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Что выполнять по команде `grunt`
    grunt.registerTask('default', [ 'copy' ]);
};
