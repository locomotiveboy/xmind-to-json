class xmind {
    constructor () {
        this.fileName = 'content';
        this.imgRegex = /\.(png|jpe?g|gif)/i;
    }

    // 对象模糊匹配key值
    objectMatchKey(obj = {}, key) {
        return Object.keys(obj).find((v) => v.indexOf(key) >= 0);
    }
};

module.exports = xmind;