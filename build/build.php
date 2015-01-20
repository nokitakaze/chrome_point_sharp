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
            array('other/main.js', 'mozilla_firefox/resources/point_sharp/lib/main.js')
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

    // Копируем Javscript исходники
    foreach (array(
                 'point_sharp_shared_code.js',
                 'point_sharp_shared_code_additional.js',
                 'point_sharp_shared_code_websocket.js',
                 'point_sharp_options_list.js',
                 'bquery_ajax.js',
                 'point-options.js'
             ) as $filename){
        copy($root_folder.'/build/src/'.$filename, $root_folder.'/chrome_point_plus/js/'.$filename);
        copy($root_folder.'/build/src/'.$filename, $root_folder.'/mozilla_firefox/resources/point_sharp/data/js/'.$filename);
    }

    // Копируем Папки
    foreach (array(
                 array('vendor', 'chrome_point_plus/vendor', 'mozilla_firefox/resources/point_sharp/data/vendor'),
                 array('css', 'chrome_point_plus/css/additional', 'mozilla_firefox/resources/point_sharp/data/css/additional'),
             ) as $pair){
        // @todo Проверить квоты
        system('rm -rf "'.addslashes($root_folder.'/'.$pair[1]).'" "'.addslashes($root_folder.'/'.$pair[2]).'"');
        system('cp -R "'.addslashes($root_folder.'/build/'.$pair[0]).'" "'.addslashes($root_folder.'/'.$pair[1]).'"');
        system('cp -R "'.addslashes($root_folder.'/build/'.$pair[0]).'" "'.addslashes($root_folder.'/'.$pair[2]).'"');
    }

    echo "Version ".$json->version.'.'.$build_version->version.' builded at '.gmdate('Y-m-d H:i:sO')."\n";
?>