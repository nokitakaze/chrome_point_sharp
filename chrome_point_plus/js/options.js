function draw_option_tree(tree) {
    for (var index in tree) {

    }
}


$(document).ready(function () {
    // Создаём DOM
    console.log("Options Tree: ", point_sharp_options_tree);
    draw_option_tree(point_sharp_options_tree);


    point_sharp_options_init(function (options) {
        console.log("point_sharp_options_init: ", options);
        // Выставляем галки

    });
});
