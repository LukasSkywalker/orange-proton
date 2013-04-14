/**
 * @class MegaMind
 * Megamind has a concept of different containers where the different nodes are put. This allows us to
 split up the page to organize the nodes as we wish. Inside the containers, the nodes are automatically
 laid out and distributed. Here are the instructions for generating a new container and adding nodes:
 - initialize a mindmap. call megamind() on a jQuery object [let that be 'mm' here] that represents a
 DOM node to do so
 - set a root node by calling setRoot() on mm, with the HTML string of the node as parameter
 - create an array which holds HTML-strings of the nodes. This is pretty straightforward, just see the examples below
 - Call the Canvas constructor on mm: mm.addCanvas(left,top,width,height). All are CSS-pixel values
 - Call .addNodes(r), specifying the array of nodes. You can add multiple node-types and -sizes in
 this array. You can also add click handlers or images or the <cat> element to the nodes.

 Notes:
 - elements that are too tall are discarded. We will have to find a better solution for this

 You get the picture.
 */

var megamind = {
  /**
   * @property {Object} options
   * @property {Number} [options.horizontalFillAmount=0.8] how much a row should be filled
   * @property {Number} [options.verticalFillAmount=0.8] how much a container should be filled
   * @property {Number} [options.verticalWobbling=0.6] how much the vertical position of nodes should vary
   * @property {Number} [options.horizontalWobbling=0.6] how much the horizontal position of nodes should vary
   * @property {Number} [options.animationDuration=400] duration of appearance animation in ms
   */
  options: {
    horizontalFillAmount: 0.8,
    verticalFillAmount: 0.8,
    verticalWobbling: 0.6,
    horizontalWobbling: 0.6,
    animationDuration: 400
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
     * @param left {Number} left offset
     * @param top {Number} top offset
     * @param width {Number} container width
     * @param height {Number} container height
     * @param options {Object}
     * @returns {Canvas} the new canvas
     */
    addCanvas: function (left, top, width, height, options) {
      var $mm = $(this.first());
      var data = $mm.data();
      if (left + width > $mm.width() || top + height > $mm.height()) {
        console.log('### Canvas with size ' + left + ',' + top + ',' + width + ',' + height +
            ' does not fit in container [' + $mm.width() + ',' + $mm.height() + ']!');
      }
      var cv = new Canvas($mm, left, top, width, height, options);
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
     * Toggle debug info for the mindmap on this element
     * @returns {boolean} true when showing, false when hiding
     */
    debug: function () {
      var $mm = $(this.first());
      var data = $mm.data();
      var debugElements = $('.debug');
      if (debugElements.length == 0) {
        $.each(data.canvases, function (i, c) {
          var canvas = $("<div class='debug' style='position: absolute; border: 1px solid black'>C" + i + "</div>");
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
            })
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

  function Canvas(mm, left, top, width, height, options) {
    this.rows = [];
    this.xOffset = left;
    this.yOffset = top;
    this.width = width;
    this.height = height;
    this.container = mm;
    this.options = $.extend({}, megamind.options, options);
    return this;
  }

  Canvas.prototype.left = function () {
    return this.xOffset;// + this.container.position().left;
  };

  Canvas.prototype.top = function () {
    return this.yOffset;// + this.container.position().top;
  };

  Canvas.prototype.doLayout = function () {
    this.space();
    for (var i = 0; i < this.rows.length; i++) {
      for (var j = 0; j < this.rows[i].nodes.length; j++) {
        var n = this.rows[i].nodes[j];
        n.el.animate({
          left: n.left(),
          top: n.top(),
          opacity: 1
        }, {duration: this.options.animationDuration, easing: 'linear'});
        this.container.data().canvas.path('M' + n.parent.getCenter().x + ' ' + n.parent.getCenter().y + 'L' + n.getCenter().x + ' ' + n.getCenter().y).attr({stroke: n.el.css('border-left-color')});
      }
    }
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
      var amount = (1 - this.options.verticalWobbling / 2) * spacing
          + Math.random() * this.options.verticalWobbling * spacing;
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


  Canvas.prototype.addNodes = function (elements) {
    elements.shuffle();

    // some preprocessing: add required classes
    for (var i = 0; i < elements.length; i++) {
      var element = $(elements[i]);
      element.addClass("node");
      element.center(this.container);
      element.css({opacity: 0});
      element.appendTo(this.container);
    }

    for (var i = 0; i < elements.length; i++) {
      var element = $(elements[i]);
      var n = new Node(element, null);
      if (n.width() > this.width || n.height() > this.height) {
        console.log("### unable to add node, is " + n.width() + "x" + n.height() +
            " px large, max is " + this.width + "x" + this.height);
        element.remove();
      } else if (n.width() > this.width / 2) {
        this.addRow(n);
      }
    }

    elements.sort(function (a, b) {
      return b.height() - a.height();
    });

    for (var i = 0; i < elements.length; i++) {
      var n = new Node(elements[i], null);
      if (n.width() <= this.width / 2) {
        if (this.currentRow() == undefined) { //no row yet
          if (n.height() <= this.height) {
            this.addRow(n);
          } else {
            alert('no space left');   // no more space left for new row
          }
        } else if (n.width() + this.currentRow().spaceUsed() <= this.width * this.options.horizontalFillAmount) { //fits in this row
          this.currentRow().addNode(n);
        } else if (this.spaceUsed() + n.height() <= this.height) {    // no more space left, new row
          this.addRow(n);
        } else {
          alert('no space left');   // no more space left for new row
          elements[i].remove();
        }
      }
    }
    this.shuffle();
    for (var i = 0; i < this.rows.length; i++) {
      this.rows[i].shuffle();
    }

    this.doLayout();

    return this;
  };

  Canvas.prototype.rowsBefore = function (row) {
    var r = [];
    for (var i = 0; i < this.rows.length && this.rows[i] != row; i++) {
      r.push(this.rows[i]);
    }
    return r;
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
      var amount = (1 - this.canvas.options.horizontalWobbling / 2) * spacing
          + Math.random() * this.canvas.options.horizontalWobbling * spacing;  // if WOBBLING is 0.4 or 40%:
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
})(jQuery);
