const xmind = require('./xmind');
const {
    parseMarker
} = require('./marker');
const convert = require('xml-js');
const format = require('xml-formatter');
const JSZip = require('jszip');
const path = require('path');

class xmindToJSON extends xmind {
    constructor(data) {
        super();
        this.data = data;
    }

    //读取图片文件信息
    async getImageInfo(res, imageName) {
        const file = await res.file(imageName).async('base64');
        const base64 = `data:image/${(path.extname(imageName) || 'png').replace(/\./g, '')};base64,` + file;
        return {
            base64,
            name: imageName
        };
    }

    //解析xmind节点文字
    transformText(data) {
        let title = data.title || data.text || '';

        return title[super.objectMatchKey(title, 'text')] || title;
    }

    //解析xmind节点备注
    transformRemark(data) {
        let plainText = (data.notes || {}).plain || {};
        // let html = (data.notes || {}).html;

        return plainText[super.objectMatchKey(plainText, 'text')] || plainText.content || '';
    }

    //解析xmind节点标签
    transformLabel(data) {
        let label = (data.labels || {}).label || {};

        return label[super.objectMatchKey(label, 'text')] || '';
    }

    //解析xmind节点图片
    transformImage(data, imgFiles) {
        let xmlInfo = data['xhtml:img'] || {};
        let imageAttr = xmlInfo[super.objectMatchKey(xmlInfo, 'attributes')] || {};
        let imageSize = {
            width: imageAttr['svg:width'],
            height: imageAttr['svg:height']
        };
        let src = imageAttr['xhtml:src'] || ((data.image || {}).src || '');
        let imageData = imgFiles[path.basename(src)] || {};
        let imageBase = imageData.base64;
        if (imageBase && (!imageSize.width || !imageSize.height)) {
            imageSize = {
                width: imageData.width,
                height: imageData.height
            };
        }

        return {
            name: imageData.name || '',
            base64: imageBase,
            size: imageSize
        };
    }

    //解析xmind节点标记
    transformMarker(data) {
        let refs = data['marker-refs'] || {};
        let markerList = refs['marker-ref'] || data.markers || [];
        if (!Array.isArray(markerList)) {
            markerList = [markerList];
        }
        let markers = {};
        markerList.forEach(marker => {
            let attr = marker[super.objectMatchKey(marker, 'attributes')] || marker;
            let markerId = attr['markerId'] || attr['marker-id'];
            let markerRes = parseMarker(markerId);
            if (markerRes.key) {
                markers[markerRes.key] = markerRes;
            }
        });

        return markers;
    }

    //解析xmind子节点
    transformChildren(data = [], imgFiles) {
        const list = data.attached || (Array.isArray(data) ? data : data.title ? [data] : []);
        return list.map((v) => {
            const {
                topic
            } = v || {};
            return this.transformData((topic || v), imgFiles);
        });
    }

    transformData(data, imgFiles) {
        let {
            children
        } = data || {};
        const {
            topics = {}
        } = children || {};
        const {
            topic
        } = topics || {}
        if (Array.isArray(topics)) {
            let realNode =  topics.filter(item => {
                let type = (item[super.objectMatchKey(item, 'attributes')] || {}).type;
                return type === 'attached';
            })[0];
            children = realNode.topic || [];
        } else if (Array.isArray(topic)) {
            children = topic;
        } else if (Array.isArray(data)) {
            children = data;
        }

        let node = {
            children: this.transformChildren(topic || children, imgFiles),
            data: {
                text: this.transformText(data),
                remark: this.transformRemark(data),
                label: this.transformLabel(data),
                image: this.transformImage(data, imgFiles),
                markers: this.transformMarker(data)
            }
        };
        return node;
    }

    async parse() {
        try {
            const zip = new JSZip();

            //解压缩xmind文件
            const res = await zip.loadAsync(this.data, {
                optimizedBinaryString: true
            });
            const {
                files
            } = res;

            //查找xmind/content.json/xml文件
            const fileName = super.objectMatchKey(files, `${this.fileName}.json`) || super.objectMatchKey(files, this.fileName);

            const file = files[fileName];
            if (!file) {
                return Promise.reject(new Error('文件解析失败'));
            }

            //获取解压包的图片列表
            const imgList = Object.keys(files).filter(file => this.imgRegex.test(path.basename(file)));
            let imgListBase = await Promise.all(imgList.map(img => this.getImageInfo(res, img)));
            const imgFiles = {};
            imgListBase.forEach(item => {
                imgFiles[path.basename(item.name)] = item;
            });

            //读取content.json/xml
            const xmindData = {
                root: {
                    data: {
                        text: ''
                    },
                    children: []
                }
            };

            const fileVal = await res.file(file.name).async('string');
            const isJsonFile = path.extname(fileName).indexOf('json') >= 0;
            let content;
            if (!isJsonFile) {
                //xml转json
                const json = JSON.parse(convert.xml2json(format(fileVal, {
                    collapseContent: true
                }), {
                    compact: true,
                    spaces: 4
                }));
                content = json['xmap-content'].sheet.topic;
            } else {
                content = (JSON.parse(fileVal).shift() || {
                    rootTopic: {}
                }).rootTopic;
            }

            xmindData.root = {
                ...this.transformData(content, imgFiles)
            }
            return Promise.resolve(xmindData);
        } catch (e) {
            return Promise.reject(e);
        }
    }
}

module.exports = xmindToJSON;