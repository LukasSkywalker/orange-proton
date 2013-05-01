var orangeproton = orangeproton || {};
orangeproton.trail = new Trail(orangeproton.options.crumbs.maxCrumbs);

function Trail (maxCrumbs) {
    this.capacity = maxCrumbs;
    this.crumbs = [];
    this.size = 0;
}

Trail.prototype.addCrumb = function(context, code) {
    if (this.size === this.capacity) {
        this.trim();
    }
    this.crumbs[this.size] = {"context": context, "code": code};
    this.size++;
};

Trail.prototype.trim = function() {
    for (var i = 0; i < this.size; i++) {
        this.crumbs[i] = this.crumbs[i+1];
    }
    this.size--;
};

Trail.prototype.getList = function() {
    var out = "<ul>";
    for (var i = 0; i < this.crumbs.length; i++) {
        var context = this.crumbs[i].context;
        var code = this.crumbs[i].code;
        out += '<li><span onclick="codeLink(\'' + code + '\');" class="clickable">' + code + '(' + context + ')</span></li>';
    }
    out += "</ul>";
    return out;
};

function codeLink(code){
    $('#code-name').val(code);
    $(document).trigger('paramChange');
}

orangeproton.trail.addCrumb("sub", "B26.0");
orangeproton.trail.addCrumb("sup", "B26.1");
orangeproton.trail.addCrumb("sub", "B26.2");
orangeproton.trail.addCrumb("sup", "B26.3");
orangeproton.trail.addCrumb("sub", "B26.4");
orangeproton.trail.addCrumb("sup", "B26.5");
orangeproton.trail.addCrumb("sub", "B26.6");
orangeproton.trail.addCrumb("sup", "B26.7");