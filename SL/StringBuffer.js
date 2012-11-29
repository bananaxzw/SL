function stringBuffer(sFirstString) {
    this._aStr = [];
    if (Object.prototype.toString.call(sFirstString) == '[object String]') this._aStr.push(sFirstString);
}
stringBuffer.prototype = {
    constructor: stringBuffer,
    add: function (str) {
        this._aStr.push(str);
        return this;
    },
    valueOf: function () {
        return this._aStr.join('');
    },
    toString: function () {
        return this._aStr.join('');
    }
}