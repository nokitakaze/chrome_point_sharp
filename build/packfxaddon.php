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
    $root_folder = realpath(__DIR__.'/../');

    /**
     * Данные о пакете из package.json, будь он неладен
     */
    $json = json_decode(file_get_contents($root_folder.'/package.json'));

    /**
     * Номер билда
     */
    $build_version = json_decode(file_get_contents($root_folder.'/build/build_version.json'));

    function addslashes_quote($s) {
        return str_replace(['\'', '"'], ['\\\'', '\\"'], $s);
    }

    // Копируем папку
    system(sprintf('rd %s /S /Q',
        escapeshellarg($root_folder.'\\mozilla_firefox_pack')));
    system(sprintf('xcopy "'.addslashes_quote($root_folder).'\\chrome_point_plus" "'.addslashes_quote($root_folder).
                   '\\mozilla_firefox_pack\\" /E /Y'));

    // Удаляем все debug
    foreach ([
                 'js/background.js',
                 'js/options_read.js',

                 'js/page_options_only.js',
                 'js/page_popup_only.js',
                 'js/point_sharp_options_list.js',
                 'js/point_sharp_shared_code.js',
                 'js/point_sharp_shared_code_additional.js',
                 'js/point_sharp_shared_code_booru.js',
                 'js/point_sharp_shared_code_websocket.js',

                 'js/point-options.js',
                 'js/wrapper.js',

                 'vendor/soundcloud/soundcloud.player.api.js',
                 'vendor/bootstrap-markdown/js/markdown.js',
             ] as $filename) {
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
    {
        $manifest = json_decode(file_get_contents($root_folder.'/mozilla_firefox_pack/manifest.json'));
        $manifest->permissions = array_filter($manifest->permissions, function ($permission) {
            return ($permission !== 'background');
        });
        file_put_contents($root_folder.'/mozilla_firefox_pack/manifest.json', json_encode($manifest), LOCK_EX);
    }
    system('web-ext build');

    chdir($old_folder);
    {
        foreach (scandir($root_folder.'/mozilla_firefox_pack\web-ext-artifacts') as $f) {
            if (preg_match('_\\.zip$_', $f)) {
                rename($root_folder.'/mozilla_firefox_pack/web-ext-artifacts/'.$f, $root_folder.'/'.$f);
            }
        }
    }
    system('rd "'.addslashes_quote($root_folder).'/mozilla_firefox_pack" /S /Q');

    echo "Version ".$json->version.'.'.$build_version->version.' builded at '.gmdate('Y-m-d H:i:sO')."\n";
?>