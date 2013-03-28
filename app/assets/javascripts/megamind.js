    function Canvas(left, top, width, height) {
      this.rows = [];
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
      mindmap_debug.canvas.push(this);
      return this;
    }
    
    var mindmap_debug = {
      canvas: [],

      showBorders: function(){
        for(var j=0; j<mindmap_debug.canvas.length; j++) {
          var c = mindmap_debug.canvas[j];
          var q = $('<div class="canvas node ui-draggable" style="border: 1px solid blue;">|canvas '+j+'| left,top,width,height = ['+c.left+','+c.top+','+c.width+','+c.height+']</div>');
          q.css({
            left: c.left,
            top: c.top,
            width: c.width,
            height: c.height
          });
          q.appendTo('body');
          for(var i=0; i<c.rows.length; i++){
            var d = c.rows[i];
            var r = $('<div class="row node ui-draggable" style="border: 1px solid green;">|row '+i+'|</div>');
            r.css({
              left: d.left(),
              top: d.top(),
              width: d.width(),
              height: d.height()
            });
            r.appendTo('body');
          }
        }
      }
    }

    Canvas.prototype.doLayout = function() {
      this.space();
      for(var i=0; i<this.rows.length; i++){
        for(var j=0; j< this.rows[i].nodes.length; j++) {
          var n = this.rows[i].nodes[j];
          n.el.css({
            left: n.left(),
            top: n.top(),
            width: n.width,
            height: n.height
          });
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
      var b = this.top;
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
        this.rows[i].move(0, spacing);
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


    Canvas.prototype.addNodes = function(nodes) {
      nodes.shuffle();
      for (var i = 0; i < nodes.length; i++) {
        var n = new Node(nodes[i], null, true);
        if( n.width > this.width ) {
          alert("### unable to add node, is "+n.width+" px wide, max is "+this.width);
        }else if (n.width > this.width / 2) {
          this.addRow(n);
        }
      }

      nodes.sort(function (a, b) {
        return $(b).height() - $(a).height();
      });

      for (var i = 0; i < nodes.length; i++) {
        var n = new Node(nodes[i], null, false);
        if (n.width <= this.width / 2) {
          if (this.currentRow() == undefined){ //no row yet
            this.addRow(n);
          }else if(n.width + this.currentRow().spaceUsed() <= this.width * 0.7) { //fits in this row (only use 70%)
            this.currentRow().addNode(n);
          } else {                             // no more space left
            this.addRow(n);
          }
        }
      }
      this.shuffle();
      for(var i=0; i<this.rows.length; i++) {
        this.rows[i].shuffle();
      }
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
      var h=0;
      var previousRows = this.canvas.rowsBefore(this);
      for(var i=0; i<previousRows.length; i++){
        h += previousRows[i].height() + previousRows[i].yOffset;
      }
      return this.canvas.top + h + this.yOffset;
    }

    Row.prototype.left = function(){
      return this.canvas.left;
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
        var amount = 0.6 * spacing + Math.random() * 0.8 * spacing;  // move between 60 and 140% of the spacing
        n.move(amount, 0);
      }
    }

    Row.prototype.move = function(x, y) {
      this.xOffset += x;
      this.yOffset += y;
    }

    Row.prototype.spaceUsed = function() {
      var w = 0;
      for(var i=0; i<this.nodes.length; i++){
        w += this.nodes[i].width;
      }
      return w;
    }

    Row.prototype.height = function() {
      var h = this.nodes[0].height;
      for(var i=0; i<this.nodes.length; i++) {
        var r = this.nodes[i];
        h = Math.max(h, r.height);
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

    function Node(el, parent, root) {
      if(root) rootNode = this;
      this.el = el;
      this.width = $(el).width();
      this.height = $(el).height();
      if(parent){
        this.parent = parent;
      }
      this.row;
      this.xOffset = 0;
      this.yOffset = 0;
    }

    Node.prototype.left = function() {
      var w = 0;
      var nodesBefore = this.row.nodesBefore(this);
      for(var i=0; i<nodesBefore.length; i++){
        var n = nodesBefore[i];
        w += n.width + n.xOffset;
      }
      return this.row.left() + w + this.xOffset;
    }

    Node.prototype.top = function() {
      return this.row.top() + this.yOffset;
    }

    Node.prototype.doLayout = function() {
      $(this.el).css({
        left: this.xOffset + this.row.left(),
        top: this.yOffset + this.row.top()
      })
    }

    Node.prototype.move = function(x, y) {
      this.xOffset = x;
      this.yOffset = y;
    }

    Node.prototype.getCenter = function() {
      return new Point(this.left() + this.width/2, this.top() + this.height/2);
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
