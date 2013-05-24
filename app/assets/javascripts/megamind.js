/*global Raphael:true, $:true, jQuery:true, document:true, console:true */
/**
 * @class megamind
 * Megamind has a concept of different containers where the different nodes are put. This allows us to
 split up the page to organize the nodes as we wish. Inside the containers, the nodes are automatically
 laid out and distributed. Here are the instructions for generating a new container and adding nodes:
 - initialize a mindmap. call megamind() on a jQuery object
 - set a root node by calling #setRoot on the element, like `mm.megamind('setRoot', params);
 - create an array which holds HTML-strings of the nodes.
 - Create a canvas with #addCanvas. Use the area-presets defined in #presets
 - Call Canvas#addNodes on the canvas, specifying the array of nodes. You can add multiple node-types and -sizes in
 this array. You can also add click handlers or images to the nodes.
 - If you need to redraw the mindmap (because of a size-change or similar) call #redraw
 - If you need debug information (a wireframe of canvases, rows and nodes), call #debug

 Notes:
 - elements that are too tall are discarded. We will have to find a better solution for this
 - Megamind needs JQuery (wow!) and Raphael (http://raphaeljs.com/) if you want it to actually work.

 You get the picture.
 */

"use strict";

var megamind = {
  /**
   * @property {Object} options UI-options for displaying the mindmap
   * @property {Number} [options.horizontalFillAmount=0.8] how much a row should be filled
   * @property {Number} [options.verticalFillAmount=0.8] how much a container should be filled
   * @property {Number} [options.verticalWobbling=0.6] how much the vertical position of nodes should vary
   * @property {Number} [options.horizontalWobbling=0.6] how much the horizontal position of nodes should vary
   * @property {Number} [options.animationDuration=400] duration of appearance animation in ms
   * @property {Boolean} [options.shuffle=true] whether megamind is allowed to shuffle the nodes inside a container. Disabling shuffling leads to a much less dense packing and generally doesn't look cool. Only use if you really need to.
   */
  options: {
    horizontalFillAmount: 0.8,
    verticalFillAmount: 0.8,
    verticalWobbling: 0.6,
    horizontalWobbling: 0.6,
    animationDuration: 400,
    shuffle: true
  },

  /**
   * Presets you can use for setting the container positions
   * @property {String[]} presets
   * @property {String} presets.topLeft
   * @property {String} presets.top
   * @property {String} presets.topRight
   * @property {String} presets.right
   * @property {String} presets.bottomRight
   * @property {String} presets.bottom
   * @property {String} presets.bottomLeft
   * @property {String} presets.left
   */
  presets: function() {
    var root = $(megamind.rootNode);
    var pre = {
      z1_t: 0,
      z2_t: root.position().top,
      z3_t: root.position().top + root.outerHeight(),
      z1_h: root.position().top - 1,
      z2_h: root.outerHeight() - 1,
      z3_h: root.position().top - 1,   //really?
      s1_l: 0,
      s2_l: root.position().left,
      s3_l: root.position().left + root.outerWidth(),
      s1_w: root.position().left - 1,
      s2_w: root.outerWidth() - 1,
      s3_w: root.position().left - 1// really?*/
    };
    function Container(col, row) {
      return {
        top : pre['z'+(row+1)+'_t'],
        left: pre['s'+(col+1)+'_l'],
        width: pre['s'+(col+1)+'_w'],
        height: pre['z'+(row+1)+'_h']
      };
    }
    return {
      topLeft: new Container(0,0),
      top: new Container(1,0),
      topRight: new Container(2,0),
      right: new Container(2,1),
      bottomRight: new Container(2,2),
      bottom: new Container(1,2),
      bottomLeft: new Container(0,2),
      left: new Container(0,1)
    };
  }
};

(function ($) {
  var methods = {
    /**
     * Create a new mindmap in the specified element
     * @param {Object} options
     * @returns {*|HTMLElement} the mindmaps container
     */
    init: function (options) {
      var $mm = $(this.first());
      var data = $mm.data();
      data.canvas = Raphael('mindmap');
      data.options = $.extend({}, megamind.options, options);
      data.canvases = [];
      data.rootNode = null;
      return $mm;
    },

    /**
     * Create a new container in an existing mindmap
     * @param {String[]} areas the preset areas to cover ('topLeft', 'top', 'bottomRight'). See #presets
     * @param options {Object}
     * @returns {Canvas} the new canvas
     */
    addCanvas: function (areas, className, options) {
      var $mm = $(this.first());
      var data = $mm.data();
      var cv = new Canvas($mm, areas, className, options);
      data.canvases.push(cv);
      return cv;
    },

    /**
     * Make an element the root node of the mindmap
     * @param {HTMLElement} element
     * @param {Boolean} animate whether the nodes (re-)positioning should be animated
     * @returns {*|HTMLElement} the node
     */
    setRoot: function (element, animate) {
      var $mm = $(this.first());
      var data = $mm.data();
      var ele = $(element);
      ele.addClass("node");
      ele.appendTo($mm);
      ele.center($mm, animate || false);
      data.rootNode = ele;
      megamind.rootNode = ele;
      /**
       * TODO a node that has no parent specified will automatically use
       * the global root node as parent. Since the node creation happens
       * at a time when no access to data.rootNode is possible, the root
       * has to be saved in the megamind object.rootNode. This is not an
       * issue per se, but it prevents megamind from being used twice on
       * the same page. Please edit this if you ever have an idea on how
       * to do this. See how I aligned every line-end of this paragraph?
       */
      return ele;
    },

    /**
     * Redraw an existing mindmap
     */
    redraw: function () {
      var $mm = $(this.first());
      var data = $mm.data();
      if( data.canvas ) {
        data.canvas.clear();
        data.canvas.setSize($mm.width(), $mm.height());
      }
      if( data.rootNode )
        data.rootNode.center($mm, false);
      if( data.canvases )
        $.each(data.canvases, function (i, c) {
          c.resize();
          c.redraw();
        });
    },

    /**
     * Toggle debug info for the mindmap on this element
     * @returns {boolean} true when showing, false when hiding
     */
    debug: function () {
      var $mm = $(this.first());
      var data = $mm.data();
      var debugElements = $('.debug');
      if (debugElements.length === 0) {
        $.each(data.canvases, function (i, c) {
          var canvas = $("<div class='debug' style='position: absolute; border: 1px solid black'>C" + i + " " + c.fillRatio() + "</div>");
          canvas.appendTo($mm);
          canvas.css({left: c.left(), top: c.top(), width: c.width, height: c.height});
          $.each(c.rows, function (j, r) {
            var row = $("<div class='debug' style='position: absolute; border: 1px solid blue'>R" + j + "</div>");
            row.appendTo($mm);
            row.css({left: r.left(), top: r.top(), width: r.width(), height: r.height()});
            $.each(r.nodes, function (k, n) {
              var node = $("<div class='debug' style='position: absolute; border: 1px solid red'>N" + k + "</div>");
              node.appendTo($mm);
              node.css({left: n.left(), top: n.top(), width: n.width(), height: n.height()});
            });
          });
        });
        return true;
      } else {
        debugElements.remove();
        return false;
      }
    },

    /**
     * Clean the element and remove all mindmap-related data
     */
    cleanUp: function () {
      var $mm = $(this.first());
      var data = $mm.data();
      $('.debug').remove();
      $('.node').remove();
      $mm.html('');
      data.canvases = [];
      data.rootNode = null;
    }
  };

  /**
   * Parent method for all megamind-related method calls. Pass the specific method
   * you want to call and any arguments as parameters, like $('#elem').megamind('debug');
   * @param {Function} method the name of the method to call
   */
  $.fn.megamind = function (method) {
    // Method calling logic
    if (methods[method]) {
      return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.megamind');
    }
  };

  /**
   * @class Canvas
   * Create a node-container
   * @param {HTMLElement} mm the container
   * @param {String[]} areas the areas to cover
   * @param {String} className an additional label to display in the background
   * @param {Object} options ...
   */
  function Canvas(mm, areas, className, options) {
    var text = getText();
    function getText() {
        if(className==="inclusiva-exclusiva"){
           var part = className.split("-");
            return '<span class="incl">' + I18n.t('mindmap.type.inclusiva') + '</span>' + " & " + '<span class="excl">' + I18n.t('mindmap.type.exclusiva') + '</span>'
        } else if(className==="field"){
            return I18n.t('mindmap.type.' + className) + ' & ' + I18n.t('mindmap.doctors');
        } else {
           return I18n.t('mindmap.type.' + className);
        }
    }

    this.rows = [];
    this.el = $('<div><div class="container-inner"><p class="show-type '+ className +'">'+ text +'</p></div></div>').addClass('container').addClass(className);
    this.overlay =  $('<div></div>').addClass('front-container').addClass(className).hoverIntent(function(){
        toggleHighlightContainer(className);
    }, null);
    this.areas = areas;
    this.resize();
    this.container = mm;
    this.options = $.extend({}, megamind.options, options);
    this.allNodes = [];
    return this;
  }

  /**
   * Get the left offset of the canvas relative to the mindmap element
   * @returns {Number} the x offset
   */
  Canvas.prototype.left = function () {
    return this.xOffset;// + this.container.position().left;
  };

  /**
   * Get the top offset of the canvas relative to the mindmap element
   * @returns {Number} the y offset
   */
  Canvas.prototype.top = function () {
    return this.yOffset;// + this.container.position().top;
  };

  /**
   * Size this node container based on the presets passed at creation
   */
  Canvas.prototype.resize = function () {
    var height = 0, width = 0, left = Infinity, top = Infinity;
    $.each(this.areas, function(i, area) {
      var preset = megamind.presets()[area];
      top = Math.min(top, preset.top);
      left = Math.min(left, preset.left);
      width = Math.max(width, preset.width + preset.left);
      height = Math.max(height, preset.height + preset.top);
    });
    width -= left;
    height -= top;
    this.height = height;
    this.width = width;
    this.xOffset = left;
    this.yOffset = top;
    this.el.css({left: this.xOffset, top: this.yOffset, width: this.width, height: this.height});
    this.overlay.css({left: this.xOffset, top: this.yOffset, width: this.width, height: this.height});
  };

  /**
   * Attach the nodes that only existed in memory to the DOM
   * This method triggers the `beforeDraw` and `afterDraw` events
   */
  Canvas.prototype.render = function () {
    this.container.trigger('beforeDraw');
    if( !this.el.isInDom() ) {
      this.el.appendTo(this.container);
    }
    if( !this.overlay.isInDom() ) {
      this.overlay.appendTo(this.container);
    }
    for (var i = 0; i < this.rows.length; i++) {
      for (var j = 0; j < this.rows[i].nodes.length; j++) {
        var n = this.rows[i].nodes[j];
        n.el.animate({
          left: n.left(),
          top: n.top(),
          opacity: 1
        }, {duration: this.options.animationDuration, easing: 'linear'});
        var x1 = n.parent.getCenter().x, y1 = n.parent.getCenter().y,
            x2 = n.getCenter().x, y2 = n.getCenter().y;
        var path = 'M{0} {1}L{2} {3}'.format(x1, y1, x2, y2);

        var color = n.el.css('border-right-color');
        var line = this.container.data().canvas
            .path('M{0} {1}L{0} {1}'.format(x1, y1))
            .attr({stroke: color});
        var newPath = {path: path};
        line.animate(newPath, this.options.animationDuration);
      }
    }
    this.container.trigger('afterDraw');
  };

  /**
   * Get the last inserted row from this Canvas
   * @returns {Row} the latest row
   */
  Canvas.prototype.currentRow = function () {
    return this.rows[this.rows.length - 1];
  };

  /**
   * Add a row containing the specified node to the canvas
   * @param {Node} node the first node
   * @returns {Row} the new row
   */
  Canvas.prototype.addRow = function (node) {
    var row = new Row(node, this);
    this.rows.push(row);
    return row;
  };

  /**
   * Calculate the bottom border of the last row
   * @returns {Number} the y position
   */
  Canvas.prototype.bottom = function () {
    var b = this.top();
    for (var i = 0; i < this.rows.length; i++) {
      var r = this.rows[i];
      b += r.height();
    }
    return b;
  };

  /**
   * Shuffle the order of the rows contained in this canvas
   */
  Canvas.prototype.shuffle = function () {
    this.rows.shuffle();
  };

  /**
   * Equally space the nodes contained in the canvas
   */
  Canvas.prototype.space = function () {
    var spaceLeft = this.height - this.spaceUsed();
    var gaps = this.rows.length + 1;
    var spacing = spaceLeft / gaps;
    for (var i = 0; i < this.rows.length; i++) {
      var amount = (1 - this.options.verticalWobbling / 2) * spacing +
        Math.random() * this.options.verticalWobbling * spacing;
      this.rows[i].move(0, amount);
      this.rows[i].space();
    }
  };

  /**
   * Calculate the vertical space already used inside the canvas
   * @returns {number} the occupied pixels
   */
  Canvas.prototype.spaceUsed = function () {
    var h = 0;
    for (var i = 0; i < this.rows.length; i++) {
      h += this.rows[i].height();
    }
    return h;
  };

  /**
   * Get all Nodes contained in the canvas
   * @returns {Node[]} all nodes
   */
  Canvas.prototype.nodeElements = function () {
    var nodes = [];
    for(var i = 0; i < this.allNodes.length; i++) {
      nodes.push(this.allNodes[i]);
    }
    return nodes;
  };

  /**
   * Re-render the canvas after a style- or size-change happened e.g. after
   * the user resized the window
   */
  Canvas.prototype.redraw = function () {
    this.distribute();
    this.render();
  };

  /**
   * Add nodes to the canvas
   * @param {String[]} elements the HTML code of the nodes to add
   */
  Canvas.prototype.addNodes = function(elements) {
    this.allNodes = elements;
    for(var i = 0; i < elements.length; i++) {
      var n = new Node(elements[i], null);
      if(this.rows.length === 0)
        this.addRow(n);
      else
        this.rows[0].addNode(n);
    }
    this.distribute();
    this.render();
  };

  /**
   * Calculate position for all Nodes contained in the canvas
   * This does not yet render the nodes. Triggers `beforePosition`
   * and `afterPosition` events
   * @returns {Canvas} itself
   */
  Canvas.prototype.distribute = function () {
    this.container.trigger('beforePosition');
    var elements = this.nodeElements();

    // some preprocessing: add required classes
    for (var i = 0; i < elements.length; i++) {
      var element = $(elements[i]);
      element.addClass("node");
      element.center(this.container);
      element.css({opacity: 0});
      element.appendTo(this.container);
    }

    // sort nodes by height
    if( this.options.shuffle ) {
      elements.sort(function (a, b) {
        return b.height() - a.height();
      });
    }

    // main layout loop
    var bestRatio = Infinity;
    var bestDistribution = [];
    var width = 1;
    while( ( bestRatio < 0.8 || bestRatio > 1.2 ) && width > 0 ) {
      this.rows = [];
      for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        var n = new Node(element, null);
        if (n.height() > this.height) {
          console.log("### unable to add node, is {0} px high, max is {1}".format(n.height(), this.height));
            $.notify.alert(I18n.t('info.info_hidden'), {close: true, autoClose : 3000});
          element.remove();
          break;
        }
        var added = false;
        if( this.options.shuffle ) {    // we are allowed to add node to earlier row
          for(var j = 0; j < this.rows.length; j++) {
            var row = this.rows[j];
            if( row.spaceUsed() + n.width() <= this.width * this.options.horizontalFillAmount * width ) {   //we can fill it in
              row.addNode(n);
              added = true;
              break;
            }
          }
        } else {                        // we need to preserve input order, so only try to add to last row
          if( this.rows.length === 0 ) {
            this.addRow(n);
            added = true;
          } else {
            var row = this.rows[this.rows.length - 1];
            if( row.spaceUsed() + n.width() <= this.width * this.options.horizontalFillAmount * width ) {   //we can fill it in
              row.addNode(n);
              added = true;
            }
          }
        }
        if( !added ) {  //we've been unable to insert the node
          if( this.spaceUsed() + n.height() <= this.height ) {  // new row will fit
            this.addRow(n);
          } else {  // no luck. out of space.
            console.log('no more vertical space left');
            $.notify.alert(I18n.t('info.info_hidden'), {close: true, autoClose : 3000});
            break;
          }
        }
      }
      var ratio = this.fillRatio();
      if( !ratio ) break;
      if( Math.abs(ratio - 1) <= Math.abs(bestRatio - 1) ) { //this ratio is better
        bestRatio = ratio;
        bestDistribution = this.rows;
      } else {  // this ratio is worse
        break;
      }
      width -= 0.1;
    }
    this.rows = bestDistribution;

    // randomize positions
    if( this.options.shuffle ) {
      this.shuffle();
      for (var i = 0; i < this.rows.length; i++) {
        this.rows[i].shuffle();
      }
    }
    this.space();
    this.container.trigger('afterPosition');
    return this;
  };

  /**
   * Get all rows above the specified row
   * @param row
   * @returns {Row[]} all higher rows
   */
  Canvas.prototype.rowsBefore = function (row) {
    var r = [];
    for (var i = 0; i < this.rows.length && this.rows[i] != row; i++) {
      r.push(this.rows[i]);
    }
    return r;
  };

  /**
   * Calculate the vertical fill-percentage of the canvas
   * @returns {number} fraction (0-1)
   */
  Canvas.prototype.fillLevel = function() {
    return this.spaceUsed() / this.height;
  };

  /**
   * Calculate the overall fill-ratio of the canvas. This number represents
   * how event the distribution across the x- and y-axis are. The closer the
   * number is to 1, the better. Larger numbers mean it's too wide, smaller
   * mean it's to high.
   * @returns {number} the ratio
   */
  Canvas.prototype.fillRatio = function() {
    var horFillLevel = 0;
    for(var i = 0; i < this.rows.length; i++) {
      horFillLevel = Math.max(horFillLevel, this.rows[i].fillLevel());
    }
    return horFillLevel / this.fillLevel();
  };

  /**
   * @class Row
   * Represents one row of nodes inside a container.
   * The two parameters are required because the Row-constructor
   * needs to know those properties early
   * @param {Node} node the first node to add to the row
   * @param {Canvas} canvas the canvas in which the row should be inserted
   */
  function Row(node, canvas) {
    this.xOffset = 0;
    this.yOffset = 0;
    this.nodes = [];
    this.canvas = canvas;
    this.addNode(node);
  }

  /**
   * Get the y position of the top border of this row
   * @returns {number} y offset
   */
  Row.prototype.top = function () {
    var h = 0;
    var previousRows = this.canvas.rowsBefore(this);
    for (var i = 0; i < previousRows.length; i++) {
      h += previousRows[i].height() + previousRows[i].yOffset;
    }
    return this.canvas.top() + h + this.yOffset;
  };

  /**
   * Get the x position of the left border of this row
   * @returns {number} x offset
   */
  Row.prototype.left = function () {
    return this.canvas.left();
  };

  /**
   * Add an additional node to the row
   * @param {Node} node the new node
   */
  Row.prototype.addNode = function (node) {
    this.nodes.push(node);
    node.row = this;
  };

  /**
   * Shuffle the nodes contained in this row
   */
  Row.prototype.shuffle = function () {
    this.nodes.shuffle();
  };

  /**
   * Equally space the nodes contained in this row based on the optional
   * spacing-settings passed to the canvas
   */
  Row.prototype.space = function () {
    var spaceLeft = this.width() - this.spaceUsed();
    var gaps = this.nodes.length + 1;
    var spacing = spaceLeft / gaps;
    for (var i = 0; i < this.nodes.length; i++) {
      var n = this.nodes[i];
      var amount = (1 - this.canvas.options.horizontalWobbling / 2) * spacing +
        Math.random() * this.canvas.options.horizontalWobbling * spacing;  // if WOBBLING is 0.4 or 40%:
      // move between 80 and 120% of the spacing
      n.move(amount, 0);
    }
  };

  /**
   * No idea
   * @param x
   * @param y
   */
  Row.prototype.move = function (x, y) {
    this.xOffset = x;
    this.yOffset = y;
  };

  /**
   * Calculate pixels of horizontal space used by nodes
   * contained in this row
   * @returns {number} the total width of all nodes
   */
  Row.prototype.spaceUsed = function () {
    var w = 0;
    for (var i = 0; i < this.nodes.length; i++) {
      w += this.nodes[i].width();
    }
    return w;
  };

  /**
   * Calculate the height of the row. This is equal to the height
   * of the highest Node
   * @returns {Number} the hotizontal size
   */
  Row.prototype.height = function () {
    var h = this.nodes[0].height();
    for (var i = 0; i < this.nodes.length; i++) {
      var r = this.nodes[i];
      h = Math.max(h, r.height());
    }
    return h;
  };

  /**
   * Get the total width of this row. This is always the same as
   * the width of the parent Canvas
   * @returns {number} total width
   */
  Row.prototype.width = function () {
    return this.canvas.width;
  };

  /**
   * Calculate the absolute position of the bottom border of the row
   * @returns {Number} bottom border position
   */
  Row.prototype.bottom = function () {
    return this.top() + this.height();
  };

  /**
   * Get all Nodes in this row that are positioned before (to the left)
   * of the specified node
   * @param {Node} node the pivot
   * @returns {Node[]} all nodes before
   */
  Row.prototype.nodesBefore = function (node) {
    var n = [];
    for (var i = 0; i < this.nodes.length && this.nodes[i] != node; i++) {
      n.push(this.nodes[i]);
    }
    return n;
  };

  /**
   * Calculate the horizontal fill-fraction that is used up
   * by nodes
   * @returns {number} the fraction (0...1)
   */
  Row.prototype.fillLevel = function() {
    return this.spaceUsed() / this.width();
  };

  /**
   * Represents a single node in the mindmap. This is where the actual content
   * is contained.
   * @param {HTMLElelemt} el the HTML element that needs to be inserted
   * @param {Node} [parent] an optional parent node
   */
  function Node(el, parent) {
    this.el = el;
    if (parent) {
      this.parent = parent;
    } else {
      this.parent = megamind.rootNode;
    }
    this.row = null;
    this.xOffset = 0;
    this.yOffset = 0;
  }

  /**
   * Get the node width
   * @returns {Number} width
   */
  Node.prototype.width = function () {
    return this.el.outerWidth();
  };

  /**
   * Get the node height
   * @returns {Number} height
   */
  Node.prototype.height = function () {
    return this.el.outerHeight();
  };

  /**
   * Get the absolute position of the left border of the node
   * @returns {Number} left position
   */
  Node.prototype.left = function () {
    var w = 0;
    var nodesBefore = this.row.nodesBefore(this);
    for (var i = 0; i < nodesBefore.length; i++) {
      var n = nodesBefore[i];
      w += n.width() + n.xOffset;
    }
    return this.row.left() + w + this.xOffset;
  };

  /**
   * Get the absolute position of the top border of the node
   * @returns {Number} top position
   */
  Node.prototype.top = function () {
    return this.row.top() + this.yOffset;
  };

  /**
   * No idea
   * @param x
   * @param y
   */
  Node.prototype.move = function (x, y) {
    this.xOffset = x;
    this.yOffset = y;
  };

  /**
   * Calculate the absolute center position of the node
   * @returns {Point} the center
   */
  Node.prototype.getCenter = function () {
    return new Point(this.left() + this.width() / 2, this.top() + this.height() / 2);
  };

  /**
   * Remove the node from everywhere
   */
  Node.prototype.remove = function () {
    if (this.parent) {
      this.parent.children.removeByValue(this);
    }
    this.el.remove();
  };

  /**
   * Represents an arbitrary two-dimensional value such as coordinates or sizes
   * @param {Number} x the x value
   * @param {Number} y the y value
   */
  function Point(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Center a jQuery element inside an arbitrary parent, if wanted with an animation
   * @param {HTMLElement} parent the container element
   * @param {Boolean} animate whether the centering should be animated
   * @returns {HTMLElement} the centered element
   */
  jQuery.fn.center = function (parent, animate) {
    this.css("position", "absolute");
    $(this).addClass('centering');
    var duration = animate ? 600 : 0;
    this.animate({
      top: Math.max(0, (($(parent).height() - $(this).outerHeight()) / 2) +
          $(parent).scrollTop()),
      left: Math.max(0, (($(parent).width() - $(this).outerWidth()) / 2) +
          $(parent).scrollLeft())
    }, {duration: duration, complete: function() {
      $(this).removeClass('centering');
      $(this).trigger('centerComplete');
    }});
    return this;
  };

  /**
   * Get the absolute center of an HTML element
   * @returns {Point} the coordinates of the center
   */
  jQuery.fn.getCenter = function () {
    var x = this.position().left + this.outerWidth() / 2;
    var y = this.position().top + this.outerHeight() / 2;
    return new Point(x, y);
  };

  /**
   * Check whether the given element is already appended to the DOM
   * @returns {Boolean} whether it's in the DOM
   */
  jQuery.fn.isInDom = function () {
    return jQuery.contains(document.documentElement, this);
  };
})(jQuery);
