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
      //TODO remove above line
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
   * Represents a node-container
   */
  function Canvas(mm, areas, className, options) {
    this.rows = [];
    this.el = $('<div></div>').addClass('container').addClass(className);
    this.areas = areas;
    this.resize();
    this.container = mm;
    this.options = $.extend({}, megamind.options, options);
    this.allNodes = [];
    return this;
  }

  Canvas.prototype.left = function () {
    return this.xOffset;// + this.container.position().left;
  };

  Canvas.prototype.top = function () {
    return this.yOffset;// + this.container.position().top;
  };

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
  };

  Canvas.prototype.render = function () {
    this.container.trigger('beforeDraw');
    if( !this.el.isInDom() ) {
      this.el.appendTo(this.container);
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

  Canvas.prototype.currentRow = function () {
    return this.rows[this.rows.length - 1];
  };


  Canvas.prototype.addRow = function (node) {
    var row = new Row(node, this);
    this.rows.push(row);
    return row;
  };

  Canvas.prototype.bottom = function () {
    var b = this.top();
    for (var i = 0; i < this.rows.length; i++) {
      var r = this.rows[i];
      b += r.height();
    }
    return b;
  };

  Canvas.prototype.shuffle = function () {
    this.rows.shuffle();
  };

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

  Canvas.prototype.spaceUsed = function () {
    var h = 0;
    for (var i = 0; i < this.rows.length; i++) {
      h += this.rows[i].height();
    }
    return h;
  };

  Canvas.prototype.nodeElements = function () {
    var nodes = [];
    for(var i = 0; i < this.allNodes.length; i++) {
      nodes.push(this.allNodes[i]);
    }
    return nodes;
  };

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

  Canvas.prototype.rowsBefore = function (row) {
    var r = [];
    for (var i = 0; i < this.rows.length && this.rows[i] != row; i++) {
      r.push(this.rows[i]);
    }
    return r;
  };

  Canvas.prototype.fillLevel = function() {
    return this.spaceUsed() / this.height;
  };

  Canvas.prototype.fillRatio = function() {
    var horFillLevel = 0;
    for(var i = 0; i < this.rows.length; i++) {
      horFillLevel = Math.max(horFillLevel, this.rows[i].fillLevel());
    }
    return horFillLevel / this.fillLevel();
  };

  function Row(node, canvas) {
    this.xOffset = 0;
    this.yOffset = 0;
    this.nodes = [];
    this.canvas = canvas;
    this.addNode(node);
  }

  Row.prototype.top = function () {
    var h = 0;
    var previousRows = this.canvas.rowsBefore(this);
    for (var i = 0; i < previousRows.length; i++) {
      h += previousRows[i].height() + previousRows[i].yOffset;
    }
    return this.canvas.top() + h + this.yOffset;
  };

  Row.prototype.left = function () {
    return this.canvas.left();
  };

  Row.prototype.addNode = function (node) {
    this.nodes.push(node);
    node.row = this;
  };

  Row.prototype.shuffle = function () {
    this.nodes.shuffle();
  };

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

  Row.prototype.move = function (x, y) {
    this.xOffset = x;
    this.yOffset = y;
  };

  Row.prototype.spaceUsed = function () {
    var w = 0;
    for (var i = 0; i < this.nodes.length; i++) {
      w += this.nodes[i].width();
    }
    return w;
  };

  Row.prototype.height = function () {
    var h = this.nodes[0].height();
    for (var i = 0; i < this.nodes.length; i++) {
      var r = this.nodes[i];
      h = Math.max(h, r.height());
    }
    return h;
  };

  Row.prototype.width = function () {
    return this.canvas.width;
  };

  Row.prototype.bottom = function () {
    return this.top() + this.height();
  };

  Row.prototype.nodesBefore = function (node) {
    var n = [];
    for (var i = 0; i < this.nodes.length && this.nodes[i] != node; i++) {
      n.push(this.nodes[i]);
    }
    return n;
  };

  Row.prototype.fillLevel = function() {
    return this.spaceUsed() / this.width();
  };

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

  Node.prototype.width = function () {
    return this.el.outerWidth();
  };

  Node.prototype.height = function () {
    return this.el.outerHeight();
  };

  Node.prototype.left = function () {
    var w = 0;
    var nodesBefore = this.row.nodesBefore(this);
    for (var i = 0; i < nodesBefore.length; i++) {
      var n = nodesBefore[i];
      w += n.width() + n.xOffset;
    }
    return this.row.left() + w + this.xOffset;
  };

  Node.prototype.top = function () {
    return this.row.top() + this.yOffset;
  };

  Node.prototype.move = function (x, y) {
    this.xOffset = x;
    this.yOffset = y;
  };

  Node.prototype.getCenter = function () {
    return new Point(this.left() + this.width() / 2, this.top() + this.height() / 2);
  };

  Node.prototype.remove = function () {
    if (this.parent) {
      this.parent.children.removeByValue(this);
    }
    this.el.remove();
  };

  function Point(x, y) {
    this.x = x;
    this.y = y;
  }

  jQuery.fn.center = function (parent, animate) {
    this.css("position", "absolute");
    var duration = animate ? 600 : 0;
    this.animate({
      top: Math.max(0, (($(parent).height() - $(this).outerHeight()) / 2) +
          $(parent).scrollTop()),
      left: Math.max(0, (($(parent).width() - $(this).outerWidth()) / 2) +
          $(parent).scrollLeft())
    }, {duration: duration, easing: 'linear'});
    return this;
  };

  jQuery.fn.getCenter = function () {
    var x = this.position().left + this.outerWidth() / 2;
    var y = this.position().top + this.outerHeight() / 2;
    return new Point(x, y);
  };

  jQuery.fn.isInDom = function () {
    return jQuery.contains(document.documentElement, this);
  };
})(jQuery);
