/**
 * $ brew install libxml2
 */
var path = require("path")
  , exec = require("child_process").exec
  , generateXML = require(path.join("..", "..", "lib", "xml.js"));

module.exports = {
  setUp: function (callback) {
    var res = [
      {
          date_str: new Date()
        , title   : "title"
        , link    : "http://example.jp"
        , content : "content"
      }
    ];
    this.xml = generateXML("title", res);

    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  "contentが正しく設定できている": function (test) {
    var matches = this.xml.match(/<content:encoded><\!\[CDATA\[content]]><\/content:encoded>/);
    test.notEqual(matches, null);
    test.done();
  },
  "xmllintが通る": function (test) {
    exec("echo '" + this.xml + "' | xmllint --noout -",
            function (err, stdout, stderr) {
      test.equal(stderr, "");
      test.done();
    });
  }
};
/* vim: set ts=2 sts=2 sw=2: */
