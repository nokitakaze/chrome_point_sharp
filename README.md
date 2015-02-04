# README #

Коротенькое пояснение what the fuck is going on.

### Что это за репозиторий? ###

В данном репозитории располагаются исходные коды расширения Point+, которое предназначено для расширения функциональности сайта [Point.im](https://point.im/).

### Как заставить его работать? ###

Есть несколько вариантов. Выбирайте на свой вкус:

* Установить расширение из [репозитория Opera addons](https://addons.opera.com/en/extensions/details/point/?display=en)
* Установить расширение из [репозитория Google Chrome Extensions](https://chrome.google.com/webstore/detail/point%2B/ghaddonhnchkdjaciggjijhophciboam?hl=ru)
* Установить расширение из [раздела Downloads на Bitbucket](https://bitbucket.org/skobkin/chrome_point_plus/downloads) (*.nex - Opera, *.crx - Chrome)
* Собрать самостоятельно из исходников ([Chrome](https://developer.chrome.com/extensions/packaging), [Opera](https://dev.opera.com/extensions/tut_basics.html))


### Как настраивать? ###

В адресной строке (омнибокс) появится иконка Point.im. Если на нёё нажать - появится окошко настроек.

![Настройки расширения](https://storage4.static.itmages.ru/i/15/0107/h_1420652338_6632200_307d80b672.png "Окно настроек расширения")

### Хочу помочь, ШТОДЕЛОЦ? ###

* Писать мне [в поинте](https://skobkin-ru.point.im/) или [куда-нибудь ещё](https://skobk.in/contacts/)
* Сразу присылать пулл-реквесты с шашкой наголо
* Поставить в магазинах Opera и Chrome оценку расширению
* Задонатить (см. таб Feedback в настройках)

### Как собрать из исходников

Для сборки используется Node.js. Ещё нужно глобально установить npm-пакет grunt-cli (`npm i -g grunt-cli`).

Все команды ниже нужно выполнять в корне проекта.

Установить npm и bower зависимости и разложить библиотеки по местам:

```
npm install
```

Если у вас нет Node.js, то вы можете посмотреть используемые библиотеки в файле `bower.json` и положить их
в `chrome_point_plus/vendor`.

Проверить кодстайл:

```
npm run lint
```

Поднять версию ([примеры](https://github.com/vojtajina/grunt-bump/blob/master/README.md#usage-examples)):

```
grunt bump
```
