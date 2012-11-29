/// <reference path="$SL.js" />


$SL.Type = function () {

}
$sl.merge($SL.Type.prototype, {

    registerNamespace: function (namespacePath) { 
    	/// <summary>
    	/// 注册命名空间 
    	/// </summary>
        /// <param name="namespacePath" type="String">命名空间全称 比如xuzhiwei.tt</param>
        var rootObject = window;
        var namespaceParts = namespacePath.split('.');

        for (var i = 0, l = namespaceParts.length; i < l; i++) {
            var currentPart = namespaceParts[i];
            var ns = rootObject[currentPart];
            var nsType = typeof (ns);
            /*
            if ((nsType !== "undefined") && (ns !== null)) {
                if (nsType === "function") {
                    throw Error.invalidOperation(String.format(Sys.Res.namespaceContainsClass, namespaceParts.splice(0, i + 1).join('.')));
                }
                if ((typeof (ns) !== "object") || (ns instanceof Array)) {
                    throw Error.invalidOperation(String.format(Sys.Res.namespaceContainsNonObject, namespaceParts.splice(0, i + 1).join('.')));
                }
            }
            */
            //#endif
            if (!ns) {
                ns = rootObject[currentPart] = {};
            }
            if (!ns.__namespace) {
               
                ns.__namespace = true;
                ns.__typeName = namespaceParts.slice(0, i + 1).join('.');
                ns.getName = function ns$() { return this.__typeName; }
            }
            rootObject = ns;
        }
    
    }



});
$sl.Type = new $SL.Type();