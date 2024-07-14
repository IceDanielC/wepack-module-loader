"use strict"
const complexCalc = (a, b) => {
    // 返回a的b次方
    return a ** b
};

/** 这里不能使用module.exports因为babel不会对module进行转换，浏览器无法识别 */
exports.default = { complexCalc }