//= require jquery
//= require jquery_ujs
//= require orangeproton.mindmap
describe("generateBubbles", function() {
  var input;
  beforeEach(function () {
    input = ['asdf', 'jklö', 'qwer'];
  });

  it("input size should match output size", function() {
    var output = orangeproton.mindmap.generateBubbles(input, Infinity, '', null, null, null);
    expect(input.size).toEqual(output.size);
  });
});