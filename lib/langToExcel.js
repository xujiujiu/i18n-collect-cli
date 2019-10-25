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

module.exports.toExcel = (url, filename, cb) => {
    const code = fs.readFileSync(path.join(process.cwd(), url.replace('/', path.sep)), 'utf-8')
    const data = jsonToData(code.slice(code.indexOf('{'), code.lastIndexOf('}') + 1).replace(/ /g, '').replace(/\ +/g,"").replace(/[\r\n]/g,"").replace(/\'/g, '"'))
    let buffer = xlsx.build([{name: '简体中文', data}])
    fs.writeFile(path.join(process.cwd(), filename),buffer,{'flag':'w'}, cb)
}
