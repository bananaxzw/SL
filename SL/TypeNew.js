/// <reference path="$SL.js" />


$SL.Type = function () {

}
$sl.merge($SL.Type.prototype, {
    registerNamespace: function (namespacePath) {
        var rootObject = window;
        var namespaceParts = namespacePath.split('.');

        for (var i = 0, l = namespaceParts.length; i < l; i++) {
            var currentPart = namespaceParts[i];
            var ns = rootObject[currentPart];
       
            if (!ns) {
                ns = rootObject[currentPart] = {};
            }
            if (!ns.__namespace) {
                ns.__namespace = true;
                ns.__typeName = namespaceParts.slice(0, i + 1).join('.');
                ns.getName = function ns$getName() { return this.__typeName; }
            }
            rootObject = ns;
        }
    
    }
});
$sl.Type = new $SL.Type();