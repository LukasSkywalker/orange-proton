var orangeproton = orangeproton || {};
orangeproton.trail = new Trail(orangeproton.options.crumbs.maxCrumbs);

function Trail (maxCrumbs) {
    this.capacity = maxCrumbs;
    this.crumbs = [];
    this.size = 0;
}

Trail.prototype.addCrumb = function(context, code, url) {
    if (this.size === this.capacity) {
        this.trim();
    }
    this.crumbs[this.size] = {"context": context, "code": code, "url": url};
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
        var url = this.crumbs[i].url;
        var code = this.crumbs[i].code;
        out += "<li><a href=" + url + ">" + code + "(" + context + ")</a></li>";
    }
    out += "</ul>";
    return out;
};

orangeproton.trail.addCrumb("sub", "B26.0", "/sub");
orangeproton.trail.addCrumb("sup", "B26.1", "/sup");
orangeproton.trail.addCrumb("sub", "B26.2", "/sub");
orangeproton.trail.addCrumb("sup", "B26.3", "/sup");
orangeproton.trail.addCrumb("sub", "B26.4", "/sub");
orangeproton.trail.addCrumb("sup", "B26.5", "/sup");
orangeproton.trail.addCrumb("sub", "B26.6", "/sub");
orangeproton.trail.addCrumb("sup", "B26.7", "/sup");