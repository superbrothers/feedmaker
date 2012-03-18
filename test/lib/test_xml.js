/**
 * $ brew install libxml2
 */
var path = require("path")
  , exec = require("child_process").exec
  , generateXML = require(path.join("..", "..", "lib", "xml.js"));

module.exports = {
  setUp: function (callback) {
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  "xmllintが通る": function (test) {
      var res = [
        {
            date_str: new Date()
          , title   : "title"
          , link    : "http://example.jp"
        }
      ]
        , xml = generateXML("title", res, function () { return "content";});

      exec("echo '" + xml + "' | xmllint --noout -",
              function (err, stdout, stderr) {
        test.equal(stderr, "");
        test.done();
      });
  }
};
/* vim: set ts=2 sts=2 sw=2: */
