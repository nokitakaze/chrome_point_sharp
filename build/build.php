#!/usr/bin/php
<?php
    /**
     * Рутовая папка проекта
     */
    $root_folder = realpath(getcwd().'/'.preg_replace('_/[^/]+$_', '/', $_SERVER['PHP_SELF']).'../');

    /**
     * Данные о пакете из package.json, будь он неладен
     */
    $json = json_decode(file_get_contents($root_folder.'./package.json'));

    /**
     * Номер билда
     */
    $build_version = json_decode(file_get_contents($root_folder.'./build/build_version.json'));
    $build_version->version++;
    file_put_contents($root_folder.'./build/build_version.json', json_encode(array(
        'last_build_time'     => time(),
        'last_build_time_str' => gmdate('Y-m-d H:i:sO'),
        'version'             => $build_version->version
    )));

    // Меняем контент
    foreach (
        array(
            array('other/bower.json', 'bower.json'),
            array('other/install.rdf', 'mozilla_firefox/install.rdf'),
            array('other/harness-options.json', 'mozilla_firefox/harness-options.json'),
            array('other/manifest.json', 'chrome_point_plus/manifest.json'),
        ) as $pair){
        // Берём контент
        $content = file_get_contents($root_folder.'/build/'.$pair[0]);

        // Меняем значения
        $content = str_replace('%%VERSION%%', $json->version.'.'.$build_version->version, $content);
        $content = str_replace('%%DESCRIPTION%%', $json->description, $content);
        $content = str_replace('%%AUTHOR%%', $json->author, $content);
        $content = str_replace('%%NAME%%', $json->name, $content);
        $content = str_replace('%%HOMEPAGE%%', 'https://bitbucket.org/NokitaKaze/chrome_point_plus-nokita-version', $content);

        // Сохраняем контент
        file_put_contents($root_folder.'/'.$pair[1], $content);
    }

    // Копируем исходники
    copy($root_folder.'/build/src/point_sharp_shared_code.js',
        $root_folder.'/chrome_point_plus/js/point_sharp_shared_code.js');
    copy($root_folder.'/build/src/point_sharp_shared_code.js',
        $root_folder.'/mozilla_firefox/resources/point_sharp/data/js/point_sharp_shared_code.js');

    copy($root_folder.'/build/src/point_sharp_shared_code_additional.js',
        $root_folder.'/chrome_point_plus/js/point_sharp_shared_code_additional.js');
    copy($root_folder.'/build/src/point_sharp_shared_code_additional.js',
        $root_folder.'/mozilla_firefox/resources/point_sharp/data/js/point_sharp_shared_code_additional.js');

    copy($root_folder.'/build/src/point_sharp_options_list.js',
        $root_folder.'/chrome_point_plus/js/point_sharp_options_list.js');
    copy($root_folder.'/build/src/point_sharp_options_list.js',
        $root_folder.'/mozilla_firefox/resources/point_sharp/data/js/point_sharp_options_list.js');
    
    copy($root_folder.'/build/src/bquery_ajax.js',
        $root_folder.'/chrome_point_plus/js/bquery_ajax.js');
    copy($root_folder.'/build/src/bquery_ajax.js',
        $root_folder.'/mozilla_firefox/resources/point_sharp/data/js/bquery_ajax.js');

    // Копируем vendor
    system('rm -rf '.addslashes($root_folder.'/chrome_point_plus/vendor').' '.
        addslashes($root_folder.'/mozilla_firefox/resources/point_sharp/data/vendor'));
    system('cp -R "'.addslashes($root_folder.'/build/vendor').'" "'.
        addslashes($root_folder.'/chrome_point_plus/vendor').'"');
    system('cp -R "'.addslashes($root_folder.'/build/vendor').'" "'.
        addslashes($root_folder.'/mozilla_firefox/resources/point_sharp/data/vendor').'"');

    echo "Version ".$json->version.'.'.$build_version->version.' builded at '.gmdate('Y-m-d H:i:sO')."\n";
?>