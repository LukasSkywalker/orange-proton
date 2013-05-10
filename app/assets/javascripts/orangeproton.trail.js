var orangeproton = orangeproton || {};
orangeproton.trail = new Trail(orangeproton.options.crumbs.maxCrumbs);

function Trail (maxCrumbs) {
    this.maxCrumbs = maxCrumbs;
    this.crumbs = [];
}

/**
 * Push a new crumb on to the crumb trail
 * @param context The context from the new code to the previous
 * @param code The new code to be pushed onto the crumb trail
 */
Trail.prototype.push = function(context, code) {
    if (this.crumbs.length > 0 && !this.isNewCrumb(code))
        return;

    this.crumbs.push({"context": context, "code": code});
    $(document).trigger('trailUpdated', [this]);
};

/**
 * Pop a crumb from the crumb trail, aka remove it
 */
Trail.prototype.pop = function() {
    this.crumbs.pop();
    $(document).trigger('trailUpdated', [this]);
};

/**
 * Determine if a crumb is new aka the last crumb has different properties from the parameters
 * @param code The code to be tested
 * @param context The context to be tested
 * @returns {Boolean} Returns true if a crumb composed of 'code' and 'context' is new, false otherwise
 */
Trail.prototype.isNewCrumb = function(code, context) {
    return this.isNewCode(code) && context !== this.crumbs.last().context;
};

/**
 * Determine if a code is new aka the last code is different from the parameter
 * @param code The code to be tested
 * @returns {Boolean} Returns true if 'code' is not the same as the last code crumb, false otherwise
 */
Trail.prototype.isNewCode = function(code) {
    return code !== this.crumbs.last().code;
};

/**
 * Trims the crumb trail up to a certain index. All elements after this index will be removed
 * @param index The index to trim the trail to
 */
Trail.prototype.trimTo = function(index) {
    this.crumbs.splice(index + 1, this.crumbs.length);
    $(document).trigger('trailUpdated', [this]);
};

Trail.prototype.setTrail = function(trail) {
    this.crumbs = trail;
    $(document).trigger('trailUpdated', [this]);
};

/**
 * Trims the crumb to the last occurence of a certain code (first from back)
 * @param code The code to trim to
 */
Trail.prototype.trimToNextOccurenceOf = function(code) {
    var idx = this.crumbs.pluck('code').lastIndexOf(code);
    this.trimTo(idx);
};

/**
 *
 * @returns {String} Returns the code of the last crumb in the trail
 */
Trail.prototype.lastCode = function() {
    return this.crumbs.last().code;
};

/**
 * Deletes all crumbs in the trail
 */
Trail.prototype.clear = function() {
    this.crumbs.clear();
    $(document).trigger('trailUpdated', [this]);
};

/**
 * Determine whether the trail is empty
 * @returns {Boolean} Returns true if trail is empty, false otherwise
 */
Trail.prototype.isEmpty = function() {
    return this.crumbs.isEmpty();
};

/**
 * Get an HTML representation of the crumb trail, encoded as an unordered list
 * @returns {String} Returns the HTML String containing the current state of the crumb trail
 */
Trail.prototype.getList = function() {
    var out = '<li><a href="/" class="icon-home" style="font-size: 16px"></a></li>';
    var length = this.crumbs.length;

    var start = length - this.maxCrumbs;
    if (start < 0) start = 0;

    var end = this.crumbs.length;

    for (var i = start; i < end; i++) {
        var context = this.crumbs[i].context;
        var code = this.crumbs[i].code;
        //TODO localize this
        var contextString = (i === start) ? 'Root' : I18n.t(context) + ' von ' + this.crumbs[i-1].code;

        out += '<li ' + ((i == end - 1) ? 'class="last"' : '') +
            'onclick="codeLink(\'{0}\', {1});" title="{2}"><span>{0}</span>'.format(code, i, contextString);
        out += '</li>';
    }
    return out;
};

function codeLink(code, idx){
    orangeproton.trail.trimTo(idx);
    $(document).trigger('paramChange', [code, null, true]);
}

$.fn.renderTrail = function( trail ) {
    $(this).html(trail.getList());
    $(".tipsy").remove();
    $(this).children('[title]').tipsy({
        trigger: 'hover',
        gravity: 's',
        delayIn: '100',
        delayOut: '0',
        fade: 'true'
    });
};

