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

    /**
     * Код для вставки Твиттора на сайт. Этот Workaround здесь появился благодаря Jorge Villalobos
     */
    $twitter_embedding_code = '';
    $code = file_get_contents($root_folder.'/build/src/point_sharp_shared_code_additional.js');
    if (preg_match('|^(function twitter_tweet_embedding_wait_for_ready_injected.+?^}$)|smui', $code, $a)) {
        $twitter_embedding_code .= $a[1]."\n";
    } else {
        echo "function twitter_tweet_embedding_wait_for_ready_injected not found\n";
    }
    if (preg_match('|^(function twitter_tweet_embedding_parse_links.+?^}$)|smui', $code, $a)) {
        $twitter_embedding_code .= $a[1]."\n";
    } else {
        echo "function twitter_tweet_embedding_parse_links not found\n";
    }
    $twitter_embedding_code = str_replace([
        '\\',
        "'",
        "\n",
    ], [
        '\\\\',
        "\\'",
        "'+\"\\n\"+'\\\n",
    ], $twitter_embedding_code);

    if (!file_exists("{$root_folder}/mozilla_firefox/lib")) {
        mkdir("{$root_folder}/mozilla_firefox/lib");
    }
    if (!file_exists("{$root_folder}/mozilla_firefox/data/css")) {
        mkdir("{$root_folder}/mozilla_firefox/data/css");
    }

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
        $content = str_replace('%%FX_TWITTER_CODE%%', $twitter_embedding_code, $content);

        // Сохраняем контент
        file_put_contents($root_folder.'/'.$pair[1], $content);
    }

    // Копируем JavaScript исходники
    foreach (array(
                 'point_sharp_shared_code.js',
                 'point_sharp_shared_code_booru.js',
                 'point_sharp_shared_code_additional.js',
                 'point_sharp_shared_code_websocket.js',
                 'point_sharp_options_list.js',
                 'bquery_ajax.js',
                 'point-options.js',
                 'date.format.js'
             ) as $filename) {
        copy($root_folder.'/build/src/'.$filename, $root_folder.'/chrome_point_plus/js/'.$filename);
    }

    function addslashes_quote($s) {
        return str_replace(['\'', '"'], ['\\\'', '\\"'], $s);
    }

    // Копируем Папки
    foreach (array(
                 array('vendor', 'chrome_point_plus/vendor', 'mozilla_firefox/data/vendor'),
                 array('css', 'chrome_point_plus/css/additional', 'mozilla_firefox/data/css/additional'),
             ) as $pair) {
        if (file_exists($root_folder.'/'.$pair[1])) {
            system('rd "'.addslashes_quote($root_folder.'\\'.str_replace('/', '\\', $pair[1])).'" /S /Q');
        }
        if (file_exists($root_folder.'/'.$pair[2])) {
            system('rd "'.addslashes_quote($root_folder.'\\'.str_replace('/', '\\', $pair[2])).'" /S /Q');
        }

        system('xcopy "'.addslashes_quote($root_folder.'\\build\\'.str_replace('/', '\\', $pair[0])).'" "'.
               addslashes_quote($root_folder.'\\'.str_replace('/', '\\', $pair[1])).'\\" /E /Y');
        system('xcopy "'.addslashes_quote($root_folder.'\\build\\'.str_replace('/', '\\', $pair[0])).'" "'.
               addslashes_quote($root_folder.'\\'.str_replace('/', '\\', $pair[2])).'\\" /E /Y');
    }

    echo "Version ".$json->version.'.'.$build_version->version.' builded at '.gmdate('Y-m-d H:i:sO')."\n";
?>