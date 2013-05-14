//= require jquery
//= require jquery_ujs
//= require orangeproton.trail
describe("Trail", function() {
  it("should create new instance", function() {
    var trail = new Trail(5);
    expect(trail.maxCrumbs).toEqual(5);
    expect(trail.crumbs).toEqual([]);
  });
  
  it("push should add if not same as last", function() {
    var trail = new Trail(5);
    expect(trail.crumbs.length).toEqual(0);
    trail.push('context1', 'code1');
    expect(trail.crumbs.length).toEqual(1);
    trail.push('context2', 'code2');
    expect(trail.crumbs.length).toEqual(2);
    trail.push('context2', 'code2');
    expect(trail.crumbs.length).toEqual(2);
  });
  
  it("pop should remove", function() {
    var trail = new Trail(5);
    trail.push('context1', 'code1');
    trail.push('context2', 'code2');
    expect(trail.crumbs.length).toEqual(2);
    trail.pop();
    expect(trail.crumbs.length).toEqual(1);
    trail.pop();
    expect(trail.crumbs.length).toEqual(0);
    trail.pop();
    expect(trail.crumbs.length).toEqual(0);
  });
  
  it("should detect new crumb", function() {
    var trail = new Trail(5);
    trail.push('context1', 'code1');
    trail.push('context2', 'code2');
    var t1 = trail.isNewCrumb('code1', 'context1');
    expect(t1).toEqual(true);
    var t2 = trail.isNewCrumb('code2', 'context2');
    expect(t2).toEqual(false);
  });
  
  it("should detect new code", function() {
    var trail = new Trail(5);
    trail.push('context1', 'code1');
    trail.push('context2', 'code2');
    var t1 = trail.isNewCode('code1');
    expect(t1).toEqual(true);
    var t2 = trail.isNewCode('code2');
    expect(t2).toEqual(false);
  });
  
  it("should trim crumbs", function() {
    var trail = new Trail(5);
    trail.push('context1', 'code1');
    trail.push('context2', 'code2');
    trail.push('context3', 'code3');
    trail.push('context4', 'code4');
    trail.push('context5', 'code5');
    trail.trimTo(3);
    expect(trail.crumbs.length).toEqual(4);
    trail.trimTo(1);
    expect(trail.crumbs.length).toEqual(2);
    trail.trimTo(4);
    expect(trail.crumbs.length).toEqual(2);
  });
  
  it("should set trail", function() {
    var trail = new Trail(5);
    trail.setTrail([{context: 'context1', code: 'code1'}, {context:'context2', code:'code2'}]);
    expect(trail.crumbs.length).toEqual(2);
  });
  
  it("should trim ToNextOccurenceOf", function() {
    var trail = new Trail(5);
    trail.push('context1', 'code1');
    trail.push('context2', 'code2');
    trail.push('context1', 'code1');
    trail.push('context2', 'code2');
    trail.trimToNextOccurenceOf('code1');
    expect(trail.crumbs.length).toEqual(3);
    trail.trimToNextOccurenceOf('code3');
    expect(trail.crumbs.length).toEqual(3);
    trail.trimToNextOccurenceOf('code1');
    expect(trail.crumbs.length).toEqual(1);
    trail.trimToNextOccurenceOf('code2');
    expect(trail.crumbs.length).toEqual(1);
  });
  
  it("should get last code", function() {
    var trail = new Trail(5);
    expect(trail.lastCode()).toEqual(undefined);
    trail.push('context1', 'code1');
    expect(trail.lastCode()).toEqual('code1');
    trail.push('context2', 'code2');
    expect(trail.lastCode()).toEqual('code2');
  });
  
  it("should clear crumbs", function() {
    var trail = new Trail(5);
    trail.push('context1', 'code1');
    trail.push('context2', 'code2');
    trail.clear();
    expect(trail.crumbs.length).toEqual(0);
  });
  
  it("should detect if crumbs empty", function() {
    var trail = new Trail(5);
    expect(trail.isEmpty()).toEqual(true);
    trail.push('context1', 'code1');
    expect(trail.isEmpty()).toEqual(false);
  });
  
  it("should get HTML list", function() {
    var trail = new Trail(5);
    trail.push('context1', 'code1');
    trail.push('context2', 'code2');
    var $list = $('<ul>' + trail.getList() + '</ul>');
    expect($list.children().length).toEqual(3); // home is included as well!
  }); 
});
