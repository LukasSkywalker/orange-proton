function Trail (maxCrumbs) {
    this.capacity = maxCrumbs;
    this.data = [];
    this.size = 0;
}

Trail.prototype.addCrumb = function(context, url) {
    this.data[this.size] = {"context": context, "url": url};
    this.size++;
    if (this.size === this.capacity) {
        this.trim();
    }
};

Trail.prototype.trim = function() {
    for (var i = 0; i < this.capacity; i++) {
        this.data[i] = this.data[i+1];
    }
};

Trail.prototype.getCrumbs = function() {
    return this.data;
};