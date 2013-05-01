var orangeproton = orangeproton || {};
orangeproton.trail = new Trail(orangeproton.options.crumbs.maxCrumbs);

function Trail (maxCrumbs) {
    this.maxCrumbs = maxCrumbs;
    this.crumbs = [];
}

Trail.prototype.push = function(context, code) {
    if (this.crumbs.length > 0 && code === this.crumbs.last().code && context === this.crumbs.last().context)
        return;

    this.crumbs.push({"context": context, "code": code});
};

Trail.prototype.pop = function() {
    this.crumbs.pop();
};

Trail.prototype.trimTo = function(index) {
    this.crumbs.splice(index + 1, this.crumbs.length);
};

Trail.prototype.clear = function() {
    this.crumbs.clear();
};

Trail.prototype.getList = function() {
    var out = '<li><a href="/" class="icon-home" style="font-size: 16px"></a></li>';
    var length = this.crumbs.length;

    var start = length - this.maxCrumbs;
    if (start < 0) start = 0;

    var end = this.crumbs.length;

    for (var i = start; i < end; i++) {
        var context = this.crumbs[i].context;
        var code = this.crumbs[i].code;
        //TODO localize this madafaka
        var contextString = (i === start) ? 'Root' : I18n.t(context) + ' von ' + this.crumbs[i-1].code;

        out += '<li onclick="codeLink(\'' + code + '\', ' + i + ');" title="' + contextString + '"><span>' + code + '</span>';
        out += '</li>';
    }
    return out;
};

function codeLink(code, idx){
    $('#code-name').val(code);
    orangeproton.trail.trimTo(idx);
    $(document).trigger('paramChange');
}

/*orangeproton.trail.addCrumb("sub", "B26.0");
orangeproton.trail.addCrumb("sup", "B26.1");
orangeproton.trail.addCrumb("sub", "B26.2");
orangeproton.trail.addCrumb("sup", "B26.3");
orangeproton.trail.addCrumb("sub", "B26.4");
orangeproton.trail.addCrumb("sup", "B26.5");
orangeproton.trail.addCrumb("sub", "B26.6");
orangeproton.trail.addCrumb("sup", "B26.7");*/