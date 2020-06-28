const xlsx = require('node-xlsx').default
const set = require('lodash.set')
const get = require('lodash.get')
const fs = require('fs')
const path = require('path')
const os = require('os')

const jsonToData = (str) => {
    let codeArr = str.split(os.EOL)
    for(let i = 0; i < codeArr.length; i++) {
        codeArr[i] = codeArr[i].replace(/[\r\n]/g,"")
        let code = codeArr[i].replace(/^\s+|\s+$/g, '')
        if(code.indexOf('//') >= 0 || code.indexOf('/*') >= 0){
            if (code.indexOf('//') === 0 || code.indexOf('/*') >= 0) {
                codeArr.splice(i, 1)
                i--
            } else {
                // todo /* 注释标识符判断
                codeArr[i] = codeArr[i].slice(0, codeArr[i].indexOf(code.slice(code.indexOf('//'))))
            }
            
        }
    }

    let s = codeArr.join("");
    let json;
    try {
      json = JSON.parse(s);
    } catch (e) {
      const obj = eval("(" + s + ")");
      json = JSON.parse(JSON.stringify(obj));
    }

    return json
}

const objToLink = (list, obj, translateUrl, traJson, linkStr) => {
    for(let lkey in obj){
        if(typeof obj[lkey] === 'string') {
          if (translateUrl && get(traJson, linkStr) && get(traJson, `${linkStr}.${lkey}`)) {
            list.push([`${linkStr}.${lkey}`, obj[lkey], get(traJson,`${linkStr}.${lkey}`)])
          } else {
            list.push([`${linkStr}.${lkey}`, obj[lkey]])
          }
        }
        if(typeof obj[lkey] === 'object') {
            objToLink(list, obj[lkey], translateUrl, traJson, `${linkStr}.${lkey}`)
        }
    }
}

const arrayToObject = (array) => {
    let obj = {}
    array.forEach(item => {
        let value = item[item.length - 1].replace('\"\'', '\\\'')
        set(obj, item[0], value)
    });
    return obj
}

const toExcel = (url, translateUrl, filename, cb) => {
    let traJson, traCode
    const code = fs.readFileSync(path.join(process.cwd(), url.replace('/', path.sep)), 'utf-8')
    const json = jsonToData(code.slice(code.indexOf('{'), code.lastIndexOf('}') + 1).replace(/\'/g, '"'))
    if(translateUrl) {
        traCode = fs.readFileSync(path.join(process.cwd(), translateUrl.replace('/', path.sep)), 'utf-8')
        traJson = jsonToData(traCode.slice(traCode.indexOf('{'), traCode.lastIndexOf('}') + 1).replace(/\'/g, '"'))
    }
    let title = ['key', '简体中文', '<Translate>']
    let data = [title]
    for(let key in json) {
        objToLink(data, json[key], translateUrl, traJson, key)
    }
    let buffer = xlsx.build([{name: '简体中文', data}])
    fs.writeFile(path.join(process.cwd(), filename),buffer,{'flag':'w'}, cb)
}

const tojs = (url, filename, cb)  => {
    let jsonCode, jsonArr, code
    try {
        let res = fs.readFileSync(process.cwd() + url.replace('/', path.sep))
        const data = xlsx.parse(res)[0].data // 第一个sheet
        data.shift() // 去除第一行，第一行是标题
        const jsonData = arrayToObject(data)
        code = `export default ${JSON.stringify(jsonData, '', 2).replace(/\"/g, '\'')}\r\n`
        fs.access(process.cwd() + filename, fs.constants.F_OK, (err) => {
            if(!err) {
                fs.unlinkSync(process.cwd() + filename)
            }
            fs.writeFile(path.join(process.cwd(), filename), code,{'flag':'w'}, cb)
        })
    } catch (err) {
        // 出错了
        cb(err)
    }
}

module.exports = {
    toExcel,
    tojs 
}
