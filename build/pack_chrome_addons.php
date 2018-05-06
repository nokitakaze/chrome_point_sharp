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

    $old_folder = getcwd();
    chdir($root_folder.'/chrome_point_plus/');

    system(sprintf('7z a -tzip %s *',
        escapeshellarg('../chrome_point_plus-'.$json->version.'.'.$build_version->version.'.zip')));

    chdir($old_folder);

    echo "Version ".$json->version.'.'.$build_version->version.' packed at '.gmdate('Y-m-d H:i:sO')."\n";
?>