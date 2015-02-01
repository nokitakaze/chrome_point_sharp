function $ajax_prot(settings) {
    if (typeof(settings) == 'undefined') {return;}
    if (typeof(settings['url']) == 'undefined') {return;}
    this.url = this.get_functional_url(settings['url']);
    if (typeof(settings['async']) !== 'undefined') {this.async = settings['async'];}
    if (typeof(settings['type']) !== 'undefined') {this.type = settings['type'];}
    if (typeof(settings['postdata']) !== 'undefined') {this.postdata = settings['postdata'];}
    if (typeof(settings['dont_set_content_type']) !== 'undefined') {
        this.dont_set_content_type = settings['dont_set_content_type'];
    }

    this.xhr = new XMLHttpRequest();
    this.xhr.parent = this;
    this.xhr.settings = settings;
    this.xhr.success = settings['success'];
    this.xhr.error = settings['error'];
    this.xhr.onreadystatechange = this.change;
    this.xhr.open(this.type, this.url, this.async);
    if ((this.type == 'POST') && !this.dont_set_content_type) {
        this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    if (typeof(settings.headers) !== 'undefined') {
        for (var i = 0; i < settings.headers.length; i++) {
            this.xhr.setRequestHeader(settings.headers[i][0], settings.headers[i][1]);
        }
    }
    this.xhr.send(this.postdata);
}

$ajax_prot.prototype = {
    version: '0.0.6a',
    url: '',
    type: 'GET',
    async: true,
    postdata: null,
    xhr: null,
    dont_set_content_type: false,
    change: function() {
        if (this.readyState !== 4) {return;}
        if (this.status == 200) {
            if (typeof(this.success) !== 'undefined') {this.success(this.responseText, this.textStatus, this);}
        } else {
            if (typeof(this.error) !== 'undefined') {this.error(this.responseText, this.textStatus, this);}
        }
    },
    get_functional_url: function(raw_url) {
        if (raw_url.match(new RegExp('^/[^/]')) || (raw_url == '/')) {
            raw_url = location.protocol + '//' + location.host + raw_url;
        } else if (raw_url.match(new RegExp('^//'))) {
            raw_url = location.protocol + raw_url;
        }

        return raw_url;
    }
}

$ajax = function(settings) {return new $ajax_prot(settings);}

function urlencode(text) {return encodeURIComponent(text);}

function sad_safe_reg(text) {
    var ar = '.-\\/[]{}?+';
    var s = '';
    for (var i = 0; i < text.length; i++) {
        if ((' ' + ar).indexOf(text[i]) > 0) {
            s += '\\' + text[i];
        } else {
            s += text[i];
        }
    }
    return s;
}

function sad_xml_getnode(node, path) {//node as domNode
    if ('' == path) {return node;}
    if ('#' == path) {return node.textContent || node.text;}

    var ri = new RegExp('^([a-z0-9.:_-]*)(\\|[0-9]+)?(/?(.*))?', 'i');
    var t = path.match(ri);
    if (t[1].length < 1) {return undefined;}
    if (t[2] == undefined) {t[2] = '';}
    if (t[4] == undefined) {t[4] = '';}

    var k = parseInt(t[2].substr(1));
    if (!(k > 0)) {k = 1;}
    var r = new RegExp('^' + sad_safe_reg(t[1]) + '$');
    for (var i = 0; i < node.childNodes.length; i++) {
        if (r.test(node.childNodes[i].nodeName)) {
            k--;
            if (k == 0) {return sad_xml_getnode(node.childNodes[i], t[4]);}
        }
    }
    return undefined;
}

function sad_xml_attribute(node, name) {
    if (node == undefined) {return undefined;}
    var r = new RegExp('^' + sad_safe_reg(name) + '$', 'i');
    for (var i = 0; i < node.attributes.length; i++) {
        if (r.test(node.attributes[i].nodeName)) {return node.attributes[i].nodeValue;}
    }
    return '';
}

function sad_x2n(xml) {
    return xml.responseXML.childNodes[xml.responseXML.childNodes.length - 1];
}
