#!/usr/bin/php
<?php
    /**
     * Рутовая папка проекта
     */
    $root_folder = realpath(__DIR__.'/../');

    /**
     * Данные о пакете из package.json, будь он неладен
     */
    $json = json_decode(file_get_contents($root_folder.'/package.json'));

    /**
     * Номер билда
     */
    $build_version = json_decode(file_get_contents($root_folder.'/build/build_version.json'));
    $build_version->version++;
    file_put_contents($root_folder.'/build/build_version.json', json_encode(array(
        'last_build_time' => time(),
        'last_build_time_str' => gmdate('Y-m-d H:i:sO'),
        'version' => $build_version->version
    )));

    // Меняем контент
    foreach (
        array(
            array('other/bower.json', 'bower.json'),
            array('other/manifest.json', 'chrome_point_plus/manifest.json'),
        ) as $pair) {
        // Берём контент
        $content = file_get_contents($root_folder.'/build/'.$pair[0]);

        // Меняем значения
        $content = str_replace('%%VERSION%%', $json->version.'.'.$build_version->version, $content);
        $content = str_replace('%%DESCRIPTION%%', $json->description, $content);
        $content = str_replace('%%AUTHOR%%', $json->author, $content);
        $content = str_replace('%%NAME%%', $json->name, $content);
        $content = str_replace('%%HOMEPAGE%%', 'https://github.com/nokitakaze/chrome_point_sharp', $content);

        // Сохраняем контент
        file_put_contents($root_folder.'/'.$pair[1], $content);
    }

    function addslashes_quote($s) {
        return str_replace(['\'', '"'], ['\\\'', '\\"'], $s);
    }

    // Копируем Папки
    foreach (array(
                 array('vendor', 'chrome_point_plus/vendor'),
                 array('css', 'chrome_point_plus/css/additional'),
             ) as $pair) {
        if (file_exists($root_folder.'/'.$pair[1])) {
            system('rd "'.addslashes_quote($root_folder.'\\'.str_replace('/', '\\', $pair[1])).'" /S /Q');
        }

        system('xcopy "'.addslashes_quote($root_folder.'\\build\\'.str_replace('/', '\\', $pair[0])).'" "'.
               addslashes_quote($root_folder.'\\'.str_replace('/', '\\', $pair[1])).'\\" /E /Y');
    }

    echo "Version ".$json->version.'.'.$build_version->version.' builded at '.gmdate('Y-m-d H:i:sO')."\n";
?>