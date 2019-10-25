const xlsx = require('node-xlsx').default
const fs = require('fs')
const path = require('path')
const os = require('os')

const jsonToData = (str) => {
    let json = JSON.parse(str)
    let title = ['key', '简体中文']
    let data = [title]
    for(let key in json) {
        for(let lkey in json[key]){
            data.push([`${key}.${lkey}`, json[key][lkey]])
        }
    }
    return data
}

const arrayToObject = (array) => {
    let obj = {}
    array.shift()
    array.forEach(item => {
        let keyArr = item[0].split('.')
        if(!obj[keyArr[0]]) {
            obj[keyArr[0]] = {}
        }
        obj[keyArr[0]][keyArr[1]] = item[1]
    });
    return obj
}

const toExcel = (url, filename, cb) => {
    const code = fs.readFileSync(path.join(process.cwd(), url.replace('/', path.sep)), 'utf-8')
    const data = jsonToData(code.slice(code.indexOf('{'), code.lastIndexOf('}') + 1).replace(/ /g, '').replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/\'/g, '"'))
    let buffer = xlsx.build([{name: '简体中文', data}])
    fs.writeFile(path.join(process.cwd(), filename),buffer,{'flag':'w'}, cb)
}

const tojs = (url, filename, cb)  => {
    fs.readFile(process.cwd() + url.replace('/', path.sep), (err, res) => {
        if(err) {
            cb(err)
        } else {
            const data = xlsx.parse(res)[0].data // 第一个sheet
            const jsonData = arrayToObject(data)
            const jsonCode = JSON.stringify(jsonData).replace(/\{\"/g, '{\n\"').replace(/\"\}/g, '\"\n}').replace(/\,\"/g, ',\n\"').replace(/\:/g, ': ').replace(/\"/g, '\'')
            const jsonArr = jsonCode.split('\n')
            const len = jsonArr.length
            let count = 0
            for(let i = 0; i < len; i++) {
                for(let j = 0; j < count; j ++) {
                    jsonArr[i] = '  ' + jsonArr[i]
                }
                let len1 = jsonArr[i].replace(/[^\{]/g, '').length
                let len2 = jsonArr[i].replace(/[^\}]/g, '').length
                count = count + len1 - len2
            }
            let code = `export default ${jsonArr.join('\n')}\n`
            fs.access(process.cwd() + filename, fs.constants.F_OK, (err) => {
                if(!err) {
                    fs.unlinkSync(process.cwd() + filename)
                }
                fs.writeFile(path.join(process.cwd(), filename), code,{'flag':'w'}, cb)
            })
        }
    })
}

module.exports = {
    toExcel,
    tojs 
}
