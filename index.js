#!/usr/bin/env node

const program = require('commander')
const getLang = require('./lib/getLang')
const writeLang = require('./lib/writeLang')
const excel = require('./lib/langToExcel')
const fs = require('fs')
const path = require('path')



program.version(require('./package').version)

// 中文收集并生成key对应中文的json文件
program.command('getlang [src]')
    .description('对[src]目录下的.vue .js 文件进行中文收集，默认src目录下面的pages和components目录')
    .option('-f, --filename <filename>', '[optional]设置生成的文件名，默认为 zh_cn.json，需为 .json 文件')
    .option('-d, --dir <pages>', '[optional]需要收集中文的文件夹，默认为pages 和 components', value => {
        return value.split(',')
    })
    .action((src = 'src', {pages = ['pages', 'components'], filename = 'zh_cn.json'}) => {
        if(filename.includes('.json')) {
            getLang.getLang(src, pages, filename)
        } else {
            console.error('filename 必须是json文件类型')
        }
    })
// 复制项目并将对应json中中文对应的key按照i18n的标准写入项目
program.command('writelang [src]')
    .description('将项目需要配置国际化的文件复制一份，并将文件中的中文替换成对应的key值，src为复制的文件目录, 默认为srcDist')
    .option('-f, --filename <filename>', '[optional]需要获取中文key值的文件，默认为 zh_cn.json')
    .option('-d, --dir <pages>', '[optional]需要替换的文件夹，默认为 pages 和 components', value => {
        return value.split(',')
    })
    .action((src = 'srcDist', {pages = ['pages', 'components'], filename = 'zh_cn.json'}) => {
        if(filename.includes('.json')) {
            writeLang.writeLang(src, pages, filename)
        } else {
            console.error('filename 必须是json文件类型')
        }
    })

// 将国际化js文件转成excel并输出，地址默认为执行脚本所在位置且不能修改    
program.command('toexcel')
    .description('将多语言js文件转成excel表格')
    .option('-u, --url <url>', '[must]多语言js文件路径, 如./src/lib/xx.js')
    .option('-f, --filename <filename>', '[optional]生成的excel文件名，默认当前位置，不能修改存储地址，格式可以为".xls", ".xml",".xlsx",".xlsm"')
    .action(({url, filename = 'zh.xlsx'}) => {
        if(!url){
            console.error('path must be url!')
            program.help();
            process.exit()
        }
        if(url.slice(url.lastIndexOf('.'), url.length) !== '.js'){
            console.error('请输入正确格式（.js）的多语言文件')
            process.exit()
        }

        if(!['.xlsx', '.xls', '.xlsm', '.xml'].includes(filename.slice(filename.lastIndexOf('.'), filename.length))){
            console.error('请输入正确格式（.xlsx，.xls）的 excel 文件名')
            process.exit()
        }
        if(filename.includes(path.sep) || filename.includes('/')){
            console.error('请输入正确的 excel 文件名称')
            process.exit()
        }
        fs.access(process.cwd() + url, fs.constants.F_OK, (err) => {
            if (err) {
                console.error(`${url}文件不存在`);
                process.exit()
            } else {
                excel.toExcel(url, filename, (err) => {
                    if(err) {
                        console.error(err)
                    } else {
                        console.log('finish!')
                    }
                })
            }
        });
        
    })

program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});
if (process.argv.length === 2) {
    program.help();
}

program.parse(process.argv);
