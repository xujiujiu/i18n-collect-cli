
const fs = require('fs')
const path = require('path')
const os = require('os')
const filePath = path.resolve('./src')
const readline = require('readline')
let test = /[\u4E00-\u9FA5\uF900-\uFA2D\uff0c\u3002\uff1f\uff01\u3001]{1,}(\d*\u0020?[\u4E00-\u9FA5\uF900-\uFA2D\uff0c\u3002\uff1f\uff01\u3001]{1,})?/
let rl = null
let isNote = false
let dirU = os.type().toLowerCase().includes('window') ? '\\' : '/' // window环境使用‘\\’mac系统使用‘/’


function delDir (path) {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach((file, index) => {
      let curPath = path + dirU + file
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
function getStat (newpath) {
  // console.log('path', newpath)
  if (!fs.existsSync(newpath)) {
    fs.mkdirSync(newpath, { recursive: true })
  }
}
function readFileList (dir, src, pages, langObj, filesList = [], ignoredir) {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(dir)
    files.forEach((item, index) => {
      if(ignoredir && ignoredir.includes(item)) return
      let fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        readFileList(path.join(dir, item), src, pages, langObj, filesList, ignoredir)// 递归读取文件
      } else {
        let ContentLine = ''
        let fileContent = ''
        let hasReplaced  = false
        let path2 = fullPath.replace(path.join(process.cwd(), dirU + 'src' + dirU), '')
        if (pages.some(pagedir => path2.includes(pagedir))) {
          let newPath = path.join(process.cwd(), dirU + src + dirU + path2)
          getStat(newPath.replace(dirU + path.basename(newPath), ''))
          let extname = path.extname(fullPath)
          if (['.vue', '.js'].includes(extname)) {
            fs.writeFileSync(newPath, {
              flag: 'a+'
            })
            isNote = false
            let fsWrite = fs.createWriteStream(newPath)
            rl = readline.createInterface({
              input: fs.createReadStream(fullPath),
              output: fsWrite
            })
            rl.on('line', (line) => {
              let content = isNote ? '' : line
              ContentLine = line
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
                }
                content = content.splice(0, content.indexOf(str)) + content.splice(content.indexOf(str) + str.length)
                if (['.vue'].includes(extname)) {
                  if(ContentLine.includes(`placeholder="${str}"`)
                  || ContentLine.includes(`title="${str}"`)
                  || ContentLine.includes(`label="${str}"`)
                  || ContentLine.includes(`tab="${str}"`)
                  || ContentLine.includes(`"${str}"`)
                  || ContentLine.includes(`'${str}'`)) {
                    ContentLine = ContentLine.replace(`placeholder="${str}"`, `:placeholder="$t('${langObj[str]}')"`)
                    ContentLine = ContentLine.replace(`title="${str}"`, `:title="$t('${langObj[str]}')"`)
                    ContentLine = ContentLine.replace(`label="${str}"`, `:label="$t('${langObj[str]}')"`)
                    ContentLine = ContentLine.replace(`tab="${str}"`, `:tab="$t('${langObj[str]}')"`)
                    ContentLine = ContentLine.replace(`'${str}'`, `this.$t('${langObj[str]}')`)
                    ContentLine = ContentLine.replace(`"${str}"`, `"{{$t('${langObj[str]}')}}"`)
                  } else {
                    ContentLine = ContentLine.replace(`${str}`, `{{$t('${langObj[str]}')}}`)
                  }
                }
                if (['.js'].includes(extname)) {
                  ContentLine = ContentLine.replace(`'${str}'`, `i18n.t('${langObj[str]}')`)
                  ContentLine = ContentLine.replace(`"${str}"`, `i18n.t('${langObj[str]}')`)
                }
                hasReplaced = true
              }
              fileContent += ContentLine + os.EOL
              fsWrite.write(ContentLine + os.EOL)
            })
            rl.on('close', () => {
              // resolve(ContentLine)
            })
          }
          filesList.push(fullPath)
        } else {
          return false
        }
      }
    })
  })
}

module.exports.writeLang = (src = 'srcDist', pages = 'pages', LangJson = '/zh_cn.json', ignoredir) => {
  let jsonFile = fs.readFileSync(path.join(process.cwd(), LangJson), 'utf-8')
  let lang = JSON.parse(jsonFile)
  let langObj = {}
  for (let cs_key in lang) {
    for (let key in lang[cs_key]) {
      langObj[lang[cs_key][key]] = cs_key + '.' + key
    }
  }
  delDir(path.join(process.cwd(), dirU + src))
  readFileList(filePath, src, pages, langObj, ignoredir).then(() => {
    console.log('write lang finish!')
  })
}
