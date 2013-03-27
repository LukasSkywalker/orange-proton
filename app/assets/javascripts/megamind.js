    function Canvas(left, top, width, height) {
      this.rows = [];
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
    }
    
    Canvas.prototype.currentRow = function(){
      return this.rows[this.rows.length - 1];
    }
    
    
    Canvas.prototype.addRow = function(node) {
      var row = new Row(this.bottom(), node, this);
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
      var gaps = this.rows.length - 1;
      var spacing = spaceLeft / gaps;
      for(var i=0; i<this.rows.length; i++) {
        this.rows[i].space();
        for(var j=0; j<this.rows[i].nodes.length; j++) {
          var n = this.rows[i].nodes[j];
          n.move(0, spacing);
        }
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
      console.log('starting...');
      for (var i = 0; i < nodes.length; i++) {
        var n = new Node(nodes[i], null, true);
        if( n.width > this.width ) {
          console.log("### unable to add node, is "+n.width+" px wide, max is "+this.width);
        }else if (n.width > this.width / 2) {
          this.addRow(n);
        }
      }

      nodes.sort(function (a, b) {
        return $(b).height() - $(a).height();
      })

      for (var i = 0; i < nodes.length; i++) {
        var n = new Node(nodes[i], null, false);
        if (n.width <= this.width / 2) {
          if (this.currentRow() == undefined){ //no row yet
            this.addRow(n);
          }else if(n.width + this.currentRow().spaceUsed() <= this.width) { //fits in this row
            this.currentRow().addNode(n);
          } else {    // no more space left
            this.addRow(n);
          }
        }
      }
    }
    
    function Row(xPos, node, canvas) {
      this.xPos = xPos;
      this.nodes = [];
      this.canvas = canvas;
      this.addNode(node);
    }
    
    Row.prototype.top = function(){
      return this.canvas.top + this.xPos;
    }
    
    Row.prototype.left = function(){
      return this.canvas.left;
    }
    
    Row.prototype.addNode = function(node) {
      node.setPosition(this.left() + this.spaceUsed(), this.top());
      this.nodes.push(node);
      node.row = this;
    }
    
    Row.prototype.shuffle = function() {
      this.nodes.shuffle();
    }
    
    Row.prototype.space = function() {
      console.log("w="+this.width()+" su="+this.spaceUsed());
      var spaceLeft = this.width() - this.spaceUsed();
      var gaps = this.nodes.length + 1;
      console.log(spaceLeft + " " + gaps);
      var spacing = spaceLeft / gaps;
      for(var i=0; i<this.nodes.length; i++) {
        var n = this.nodes[i];
        console.log(spacing);
        n.move((i+1) * spacing, 0);
      }
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

    function Node(el, parent, root) {
      if(root) rootNode = this;
      this.el = el;
      this.width = $(el).width();
      this.height = $(el).height();
      if(parent){
        this.parent = parent;
      }
      this.row;
    }
    
    Node.prototype.setPosition = function(left, top) {
      this.el.css({
        top: top + 'px',
        left: left + 'px'
      });
    }
    
    Node.prototype.move = function(x, y) {
      var p = this.position();
      this.setPosition(p.left + x, p.top + y);
    }
    
    Node.prototype.position = function() {
      var pos = $(this.el).position();
      return {x: pos.left, y: pos.top};
    }
    
    Node.prototype.getCenter = function() {
      return new Point(this.el.position().left + this.width/2, this.el.position().top + this.height/2);
    }
    
    Node.prototype.remove = function() {
      if(this.parent) {
        this.parent.children.removeByValue(this);
      }
      this.el.remove();
    }
