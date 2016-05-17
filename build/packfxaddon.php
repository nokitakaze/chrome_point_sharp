#!/usr/bin/php
<?php
    /**
     * Этот файл пакует папку mozilla_firefox в аддон так, чтобы его можно было залить на Mozilla Addons
     * Удаляем все console.log, info, debug etc, а то лисоёбы негодуют
     *
     * Taking this opportunity, I would like to say hello to moderators of addons.mozilla.org, Leszek Życzkowski & erosman
     */

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

    function addslashes_quote($s) {
        return str_replace(['\'', '"'], ['\\\'', '\\"'], $s);
    }

    // Копируем папку
    system('rd "'.addslashes_quote($root_folder).'\\mozilla_firefox_pack" /S /Q');
    system('xcopy "'.addslashes_quote($root_folder).'\\mozilla_firefox" "'.addslashes_quote($root_folder).
           '\\mozilla_firefox_pack\\" /E /Y');

    // Удаляем все debug
    foreach (array(
                 'lib/main.js',
                 'data/js/wrapper.js',
                 'data/js/point_sharp_shared_code.js',
                 'data/js/point_sharp_shared_code_additional.js',
                 'data/js/point_sharp_shared_code_websocket.js',
                 'data/js/point_sharp_options_list.js',
                 'data/js/point-options.js',
                 'data/vendor/soundcloud/soundcloud.player.api.js',
                 'data/vendor/bootstrap-markdown/js/markdown.js'
             ) as $filename) {
        if (!file_exists("{$root_folder}/mozilla_firefox_pack/{$filename}")) {
            die("File {$filename} does not exist\n");
        }
        $full_file_name = $root_folder.'/mozilla_firefox_pack/'.$filename;
        $buf = file_get_contents($full_file_name);

        $lines = preg_split('|\\r?\\n|', $buf);
        $lines_count = 0;
        foreach ($lines as &$line) {
            if (preg_match('|^[ \\t]*console\\.|', $line)) {
                $line = 'if(false) '.$line;
                $lines_count++;
            }
        }
        $buf = implode("\n", $lines);
        echo "File: {$filename}, all lines ".count($lines).", including with `console` call {$lines_count} lines\n";

        file_put_contents($full_file_name, $buf);
    }


    // Пакуем
    $old_folder = getcwd();
    chdir($root_folder.'/mozilla_firefox_pack/');
    $pack_filename = $root_folder.'/../mozilla_firefox-undebugged-'.$json->version.'.'.$build_version->version.'.xpi';
    if (file_exists($pack_filename)) {
        unlink($pack_filename);
    }
    system('zip -r "'.addslashes_quote($pack_filename).'" ./');
    chdir($old_folder);
    system('rd "'.addslashes_quote($root_folder).'/mozilla_firefox_pack" /S /Q');


    echo "Version ".$json->version.'.'.$build_version->version.' builded at '.gmdate('Y-m-d H:i:sO')."\n";
?>