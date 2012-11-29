(function (global, DOC) {
    var dom = global[escape(DOC.URL.split("#")[0])];
    dom.define("test", ["SL.Core"], function (dom) {
        dom.log("test_module");
    });
})(this, this.document);