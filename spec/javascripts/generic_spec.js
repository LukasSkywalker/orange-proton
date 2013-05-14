describe("Generic", function() {
  it("should polyfill console.log", function() {
    window.console = null;
    orangeproton.generic.injectConsoleLog();
    expect(console.log).not.toBe(undefined);
  });
  
  it("should read url params", function() {
    var url = "http://example.com/mypage?code=code1&page=page1&lang=de&code=code2"
    var urlVars = orangeproton.generic.getUrlVars(url);
    expect(urlVars.code).toBe('code2');
    expect(urlVars.page).toBe('page1');
    expect(urlVars.lang).toBe('de');
  });
});

