
const fs = require('fs')
const path = require('path')
const os = require('os')
const filePath = path.resolve('./src')
const readline = require('readline')
let test = /[\u4E00-\u9FA5\uF900-\uFA2D\uff0c\u3002\uff1f\uff01\u3001]{1,}(\d*\u0020?[\u4E00-\u9FA5\uF900-\uFA2D\uff0c\u3002\uff1f\uff01\u3001]{1,})?/
let rl = null
let lang = {}
let isNote = false
let dirU = os.type().toLowerCase().includes('window') ? '\\' : '/' // window环境使用‘\\’mac系统使用‘/’

function readFileList (dir, pages, filesList = []) {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(dir)
    files.forEach((item, index) => {
      let fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        readFileList(path.join(dir, item), pages, filesList).then(res => resolve(lang))// 递归读取文件
      } else {
        let path2 = fullPath.replace(process.cwd() + dirU + 'src' + dirU, '')
        if (pages.some(pagedir => path2.includes(pagedir))) {
          pages.some(pagedir => {
            if(path2.includes(pagedir)){
              path2 = path2.replace(pagedir + dirU, '')
              return true
            }
            return false
          })
          let key = path2.substr(0, path2.indexOf(dirU))
          let extname = path.extname(fullPath)
          if (['.vue', '.js'].includes(extname)) {
            isNote = false
            rl = readline.createInterface({
              input: fs.createReadStream(fullPath)
            })
            rl.on('line', (line) => {
              let content = isNote ? '' : line
              if (line.includes('/*')) {
                isNote = true
                content = line.slice(0, line.indexOf('/*'))
              }
              if (line.includes('*/')) {
                if (isNote) {
                  isNote = false
                  content = line.slice(line.indexOf('*/') + 2)
                }
              }
              if (line.includes('<!--')) {
                isNote = true
                content = line.slice(0, line.indexOf('<!--'))
              }
              if (line.includes('-->')) {
                if (isNote) {
                  isNote = false
                  content = line.slice(line.indexOf('-->') + 3)
                }
              }
              if (isNote && !content) return
              if (line.includes('//')) content = line.slice(0, line.indexOf('//'))

              let str = content.match(test)
              while (str) {
                str = content.match(test)
                if (str) {
                  str = str[0]
                  let otherStr = ''
                  if (content.indexOf('\'' + str) > -1) {
                    let contentArr = content.split(str)
                    otherStr = contentArr[1].slice(0, contentArr[1].indexOf('\''))
                  }
                  if (content.indexOf('"' + str) > -1) {
                    let contentArr = content.split(str)
                    otherStr = contentArr[1].slice(0, contentArr[1].indexOf('"'))
                  }
                  
                  if (content.indexOf('>' + str) > -1) {
                    let contentArr = content.split(str)
                    otherStr = contentArr[1].slice(0, contentArr[1].indexOf('<'))
                  }
                  if (content.indexOf(str + '"') > -1) {
                    let contentArr = content.split(str)
                    let reverseStr = contentArr[0].split("").reverse()
                    str = reverseStr.splice(0, reverseStr.indexOf('"')).reverse().join("") + str
                  } else {
                    str += otherStr.replace(/{{(.*)}}/g, '')
                  }
                  if (lang[key]) {
                    lang[key].push(str)
                  } else {
                    lang[key] = [str]
                  }
                }
                content = content.replace(str, 'a1')
              }
            })
            rl.on('close', () => {
              resolve(lang)
            })
          }
          filesList.push(fullPath)
        }
      }
    })
  })
}

function inputLangs (fileName) {
  let item

  let cs_Lang = {
    cs_common: {}
  }

  let allObj = {}
  for (item in lang) {
    let arr = lang[item]
    for (let val of arr) {
      if (allObj[val]) {
        allObj[val] = 2
      } else {
        allObj[val] = 1
      }
    }
  }
  let count = 0
  let otherObjs = {}

  // console.log(allObj)
  // 提取公共
  for (let obj in allObj) {
    if (allObj[obj] === 2) {
      count++
      cs_Lang['cs_common']['cs_' + count] = obj
      otherObjs[obj] = true
    } else {
    }
  }

  for (item in lang) {
    let arr = lang[item]
    cs_Lang[`cs_${item}`] = {}

    for (let val of arr) {
      if (!otherObjs[val]) {
        count++
        cs_Lang[`cs_${item}`]['cs_' + count] = val
      } else {
      }
    }
  }
  let str = JSON.stringify(cs_Lang).replace(/\"/g, '\'')

  fs.writeFile(fileName, str, function (error) {
    if (error) {
      console.log(error)
    } else {
      console.log('collect lang finish!')
    }
  })
}

module.exports.getLang = (src = 'src', pages = ['pages', 'components'], fileName = 'zh_cn.json') => {
  readFileList(path.join(process.cwd(), src), pages).then(res => {
    inputLangs(fileName)
  })
}
