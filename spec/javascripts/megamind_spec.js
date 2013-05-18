describe('Megamind', function() {
  beforeEach(function() {
    loadFixtures('main.html');
    $('#mindmap').megamind();
    window.mmTest = {rootNode : $('#rootNode') };
  });
  
  it('should generate canvas', function() {
    expect($('#mindmap')).toContain('svg');
    expect($('#mindmap').data('canvas')).toBeDefined();
    expect($('#mindmap').data('canvases')).toEqual([]);
  });
  
  it('should set root node', function() {
    var rootNode = window.mmTest.rootNode;
    $('#mindmap').megamind('setRoot', rootNode, false);
    expect($('#mindmap')).toContain('div.node');
    expect($('#mindmap').data('rootNode')).toEqual(rootNode);
  });
  
  it('should add canvas', function() {
    var rootNode = window.mmTest.rootNode;
    $('#mindmap').megamind('setRoot', rootNode, false);
    expect($('#mindmap').data('canvases').length).toBe(0);
    var c = $('#mindmap').megamind('addCanvas', ['top'], 'syn');
    expect($('#mindmap').data('canvases').length).toBe(1);
    expect($('#mindmap').data('canvases')[0].width).toBe(rootNode.outerWidth() - 1);
  });
  
  it('should add nodes', function() {
    var rootNode = window.mmTest.rootNode;
    $('#mindmap').megamind('setRoot', rootNode, false);
    var c = $('#mindmap').megamind('addCanvas', ['top'], 'syn');
    expect(c.allNodes.length).toBe(0);
    var nodes = [$('<div id="n1"/>'), $('<div id="n2"/>'), $('<div id="n3"/>')];
    c.addNodes(nodes);
    expect(c.allNodes.length).toBe(3);
  });
  
  it('should not shuffle nodes if shuffling disabled', function() {
    var rootNode = window.mmTest.rootNode;
    $('#mindmap').megamind('setRoot', rootNode, false);
    var c = $('#mindmap').megamind('addCanvas', ['top'], 'syn', {shuffle: false});
    expect(c.allNodes.length).toBe(0);
    var nodes = [$('<div id="n1"/>'), $('<div id="n2"/>'), $('<div id="n3"/>')];
    c.addNodes(nodes);
    expect(c.allNodes.length).toBe(3);
    expect(c.allNodes[0]).toEqual(nodes[0]);
    expect(c.allNodes[1]).toEqual(nodes[1]);
    expect(c.allNodes[2]).toEqual(nodes[2]);
    c.distribute();
    expect(c.allNodes[0]).toEqual(nodes[0]);
    expect(c.allNodes[1]).toEqual(nodes[1]);
    expect(c.allNodes[2]).toEqual(nodes[2]);
  });
  
  it('should clean up', function() {
    var rootNode = window.mmTest.rootNode;
    $('#mindmap').megamind('setRoot', rootNode, false);
    var c = $('#mindmap').megamind('addCanvas', ['top'], 'syn', {shuffle: false});
    var nodes = [$('<div id="n1"/>'), $('<div id="n2"/>'), $('<div id="n3"/>')];
    c.addNodes(nodes);
    $('#mindmap').megamind('cleanUp');
    expect($('#mindmap')).toBeEmpty();
  });
});
