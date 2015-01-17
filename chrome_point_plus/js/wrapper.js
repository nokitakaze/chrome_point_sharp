/**
 * Враппер над браузеро-зависимыми функциями
 * Версия для Google Chrome
 */

/**
 * Получаем значение из Local Storage
 *
 * @param key Название элемента
 * @param callback Функция, которую дёрнем, когда получим значение
 */
function local_storage_get(key, callback) {
    // @todo Реализовать
    console.log("Content code. local_storage_get %s %O", key, callback);
    console.log("Content code. local_storage_get end");
}

/**
 * Сохраняем значение в Local Storage
 *
 * @param key Название элемента
 * @param value Значение элемента
 * @param success_callback Функция, которую дёрнем, когда сохраним значение
 */
function local_storage_set(key, value, success_callback) {
    // @todo Реализовать
    console.log("Content code. local_storage_set %s = %O", key, value);
    console.log("Content code. local_storage_set end");
}

/**
 * Функция, которая выполняется перед всеми улучшениями
 *
 * @param options Опции
 */
function point_loaded_first(options) {

}

/**
 * Функция, которая выполняется после всех улучшений
 *
 * @param options Опции
 */
function point_loaded_last(options) {

}
