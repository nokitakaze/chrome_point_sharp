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

    // Копируем папку
    system('rm -r "'.addslashes($root_folder).'/mozilla_firefox_pack"');
    system('cp -R "'.addslashes($root_folder).'/mozilla_firefox" "'.addslashes($root_folder).'/mozilla_firefox_pack"');

    // Удаляем все debug
    foreach (array(
                 'lib/main.js',
                 'data/js/wrapper.js',
                 'data/js/point_sharp_shared_code.js',
                 'data/js/point_sharp_shared_code_additional.js',
                 'data/js/point_sharp_shared_code_websocket.js',
                 'data/js/point_sharp_options_list.js',
                 'data/js/point-options.js'
             ) as $filename) {
        $full_file_name = $root_folder.'/mozilla_firefox_pack/resources/point_sharp/'.$filename;
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
        echo "File: {$filename}, all lines ".count($lines).', including with console call: '.$lines_count."\n";

        file_put_contents($full_file_name, $buf);
    }


    /**
     * SHA256-хеш с файла для harness-options.json
     */
    $main_js_sha256_hash = null;

    exec('openssl dgst -sha256 -hex "'.$root_folder.'/mozilla_firefox_pack/resources/point_sharp/lib/main.js"', $buf);
    if (preg_match('|([a-z0-9]{64,64})|', implode("\n", $buf), $a)) {
        $main_js_sha256_hash = $a[1];
    } else {
        echo "Can not get 256 hash for file main.js\n";
        die();
    }

    $buf = file_get_contents($root_folder.'/mozilla_firefox_pack/harness-options.json');
    $buf = str_replace('%%MAINJS_SHA256%%', $main_js_sha256_hash, $buf);
    file_put_contents($root_folder.'/mozilla_firefox_pack/harness-options.json', $buf);

    // Пакуем
    $old_folder = getcwd();
    chdir($root_folder.'/mozilla_firefox_pack/');
    $pack_filename = $root_folder.'/../mozilla_firefox-undebugged-'.$json->version.'.'.$build_version->version.'.xpi';
    unlink($pack_filename);
    system('zip -r "'.addslashes($pack_filename).'" ./');
    chdir($old_folder);
    system('rm -r "'.addslashes($root_folder).'/mozilla_firefox_pack"');


    echo "Version ".$json->version.'.'.$build_version->version.' builded at '.gmdate('Y-m-d H:i:sO')."\n";
?>