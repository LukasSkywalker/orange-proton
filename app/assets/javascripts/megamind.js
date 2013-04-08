var megamind = {
  rootNode : null,
  container : null,
  canvases : []
}

const HORIZONTAL_FILL_AMOUNT = 0.9;  // how much should a row be filled in [0,1]
const HORIZONTAL_WOBBLING = 1;       // how much the horiz. spacing should vary (in [0,1])

const VERTICAL_WOBBLING = 1;

jQuery.fn.extend({
  megamind: function(){
    var mm = $(this.first());
    megamind.container = mm;
    megamind.canvas = Raphael('mindmap');
    return mm;
  },

  addCanvas: function( left, top, width, height) {
    var mm = $(this.first());
    if(left + width > mm.width() || top + height > mm.height()){
      console.log('### Canvas with size '+left+','+top+','+width+','+height+
          ' does not fit in container ['+mm.width()+','+mm.height()+']!');
    }
    var cv = new Canvas(left, top, width, height);
    megamind.canvases.push(cv);
    return cv;
  },

  setRoot: function( element ) {
    var mm = $(this.first());
    var ele = $(element);
    ele.addClass("node");
    ele.appendTo(mm);
    ele.center(mm);
    megamind.rootNode = ele;
    return ele;
  },

  debug: function() {
    var debugElements = $('.debug');
    if(debugElements.length == 0) {
      $.each(megamind.canvases, function(i, c) {
        var canvas = $("<div class='debug' style='position: absolute; border: 1px solid black'>C" + i + "</div>");
        canvas.appendTo(megamind.container);
        canvas.css({left: c.left(), top: c.top(), width: c.width, height: c.height});
        $.each(c.rows, function(j, r) {
          var row = $("<div class='debug' style='position: absolute; border: 1px solid blue'>R" + j + "</div>");
          row.appendTo(megamind.container);
          row.css({left: r.left(), top: r.top(), width: r.width(), height: r.height()});
          $.each(r.nodes, function(k, n) {
            var node = $("<div class='debug' style='position: absolute; border: 1px solid red'>N" + k + "</div>");
            node.appendTo(megamind.container);
            node.css({left: n.left(), top: n.top(), width: n.width(), height: n.height()});
          })
        });
      });
      return true;
    }else{
      debugElements.remove();
      return false;
    }
  },

  cleanUp: function() {
    $('.debug').remove();
    $('.node').remove();
    $('#mindmap').html('');
    megamind.canvases = [];
    megamind.rootNode = null;
    megamind.container = null;
  }
});

    function Canvas(left, top, width, height) {
      this.rows = [];
      this.xOffset = left;
      this.yOffset = top;
      this.width = width;
      this.height = height;
      this.container = $(megamind.container);
      return this;
    }

    Canvas.prototype.left = function() {
      return this.xOffset// + this.container.position().left;
    }

    Canvas.prototype.top = function() {
      return this.yOffset// + this.container.position().top;
    }

    Canvas.prototype.doLayout = function() {
      this.space();
      var root = megamind.rootNode;
      var center = { x: root.position().left + root.outerWidth() / 2, y: root.position().top + root.outerHeight() / 2 };
      for(var i=0; i<this.rows.length; i++){
        for(var j=0; j< this.rows[i].nodes.length; j++) {
          var n = this.rows[i].nodes[j];
          n.el.animate({
            left: n.left(),
            top: n.top(),
            opacity: 1
          }, {duration: 1000, easing: 'linear'} );
          megamind.canvas.path('M'+center.x+' '+center.y+'L'+n.getCenter().x+' '+n.getCenter().y).attr({stroke: n.el.css('border-left-color')});;
        }
      }
    }

    Canvas.prototype.currentRow = function(){
      return this.rows[this.rows.length - 1];
    }


    Canvas.prototype.addRow = function(node) {
      var row = new Row(node, this);
      this.rows.push(row);
      return row;
    }

    Canvas.prototype.bottom = function() {
      var b = this.top();
      for(var i=0; i<this.rows.length; i++){
        var r = this.rows[i];
        b += r.height();
      }
      return b;
    }

    Canvas.prototype.shuffle = function() {
      this.rows.shuffle();
    }

    Canvas.prototype.space = function() {
      var spaceLeft = this.height - this.spaceUsed();
      var gaps = this.rows.length + 1;
      var spacing = spaceLeft / gaps;
      for(var i=0; i<this.rows.length; i++) {
        var amount = (1 - VERTICAL_WOBBLING/2) * spacing
            + Math.random() * VERTICAL_WOBBLING * spacing;
        this.rows[i].move(0, amount);
        this.rows[i].space();
      }
    }

    Canvas.prototype.spaceUsed = function() {
      var h = 0;
      for(var i=0; i<this.rows.length; i++){
        h += this.rows[i].height();
      }
      return h;
    }


    Canvas.prototype.addNodes = function(elements) {
      elements.shuffle();

      // some preprocessing: add required classes
      for(var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        element.addClass("node");
        element.center(megamind.container);
        element.css({opacity: 0});
      }

      for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        $(element).appendTo(megamind.container);
        var n = new Node(element, null);
        if( n.width() > this.width || n.height() > this.height ) {
          console.log("### unable to add node, is "+n.width()+"x"+ n.height()+
              " px large, max is "+this.width+"x"+this.height);
          element.remove();
        }else if (n.width() > this.width / 2) {
          this.addRow(n);
        }
      }

      elements.sort(function (a, b) {
        return b.height() - a.height();
      });

      for (var i = 0; i < elements.length; i++) {
        var n = new Node(elements[i], null);
        if (n.width() <= this.width / 2) {
          if (this.currentRow() == undefined){ //no row yet
            if(n.height() <= this.height){
              this.addRow(n);
            }else{
              alert('no space left');   // no more space left for new row
            }
          }else if(n.width() + this.currentRow().spaceUsed() <= this.width * HORIZONTAL_FILL_AMOUNT) { //fits in this row
            this.currentRow().addNode(n);
          } else if(this.spaceUsed() + n.height() <= this.height) {    // no more space left, new row
            this.addRow(n);
          }else {
            alert('no space left');   // no more space left for new row
            elements[i].remove();
          }
        }
      }
      this.shuffle();
      for(var i=0; i<this.rows.length; i++) {
        this.rows[i].shuffle();
      }

      this.doLayout();

      return this;
    }

    Canvas.prototype.rowsBefore = function(row) {
      var r = [];
      for(var i=0; i<this.rows.length && this.rows[i] != row; i++){
        r.push(this.rows[i]);
      }
      return r;
    }

    function Row(node, canvas) {
      this.xOffset = 0;
      this.yOffset = 0;
      this.nodes = [];
      this.canvas = canvas;
      this.addNode(node);
    }

    Row.prototype.top = function(){
      var h = 0;
      var previousRows = this.canvas.rowsBefore(this);
      for(var i=0; i<previousRows.length; i++){
        h += previousRows[i].height() + previousRows[i].yOffset;
      }
      return this.canvas.top() + h + this.yOffset;
    }

    Row.prototype.left = function(){
      return this.canvas.left();
    }

    Row.prototype.addNode = function(node) {
      this.nodes.push(node);
      node.row = this;
    }

    Row.prototype.shuffle = function() {
      this.nodes.shuffle();
    }

    Row.prototype.space = function() {
      var spaceLeft = this.width() - this.spaceUsed();
      var gaps = this.nodes.length + 1;
      var spacing = spaceLeft / gaps;
      for(var i=0; i<this.nodes.length; i++) {
        var n = this.nodes[i];
        var amount = (1 - HORIZONTAL_WOBBLING/2) * spacing
            + Math.random() * HORIZONTAL_WOBBLING * spacing;  // if WOBBLING is 0.4 or 40%:
                                                              // move between 80 and 120% of the spacing
        n.move(amount, 0);
      }
    }

    Row.prototype.move = function(x, y) {
      this.xOffset = x;
      this.yOffset = y;
    }

    Row.prototype.spaceUsed = function() {
      var w = 0;
      for(var i=0; i<this.nodes.length; i++){
        w += this.nodes[i].width();
      }
      return w;
    }

    Row.prototype.height = function() {
      var h = this.nodes[0].height();
      for(var i=0; i<this.nodes.length; i++) {
        var r = this.nodes[i];
        h = Math.max(h, r.height());
      }
      return h;
    }

    Row.prototype.width = function() {
      return this.canvas.width;
    }

    Row.prototype.bottom = function() {
      return this.top() + this.height();
    }

    Row.prototype.nodesBefore = function(node) {
      var n = [];
      for(var i=0; i<this.nodes.length && this.nodes[i] != node; i++){
        n.push(this.nodes[i]);
      }
      return n;
    }

    function Node(el, parent) {
      this.el = el;
      if(parent){
        this.parent = parent;
      }else{
        this.parent = megamind.rootNode;
      }
      this.row;
      this.xOffset = 0;
      this.yOffset = 0;
    }

    Node.prototype.width = function() {
      return this.el.outerWidth();
    }

    Node.prototype.height = function() {
      return this.el.outerHeight();
    }

    Node.prototype.left = function() {
      var w = 0;
      var nodesBefore = this.row.nodesBefore(this);
      for(var i=0; i<nodesBefore.length; i++){
        var n = nodesBefore[i];
        w += n.width() + n.xOffset;
      }
      return this.row.left() + w + this.xOffset;
    }

    Node.prototype.top = function() {
      return this.row.top() + this.yOffset;
    }

    Node.prototype.move = function(x, y) {
      this.xOffset = x;
      this.yOffset = y;
    }

    Node.prototype.getCenter = function() {
      return new Point(this.left() + this.width()/2, this.top() + this.height()/2);
    }

    Node.prototype.remove = function() {
      if(this.parent) {
        this.parent.children.removeByValue(this);
      }
      this.el.remove();
    }

    function Point(x, y) {
      this.x = x;
      this.y = y;
    }
    
    jQuery.fn.center = function ( parent ) {
      this.css("position","absolute");
      this.css("top", Math.max(0, (($(parent).height() - $(this).outerHeight()) / 2) + 
                                                  $(parent).scrollTop()));
      this.css("left", Math.max(0, (($(parent).width() - $(this).outerWidth()) / 2) + 
                                                  $(parent).scrollLeft()));
      return this;
    }
