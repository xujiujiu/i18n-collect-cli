#!/usr/bin/env node

const program = require('commander')
const child_process = require('child_process')
const getLang = require('./getLang')
const writeLang = require('./writeLang')



program.version(require('./package').version)

program.command('getlang [src]')
    .description('对[src]目录下的.vue .js 文件进行中文收集，默认src目录下面的pages和components目录')
    .option('-f, --filename <filename>', '设置生成的文件名，默认为 zh_cn')
    .option('-d, --dir <pages>', '需要收集中文的文件夹，默认为pages 和 components', value => {
        return value.split(',')
    })
    .action((pages = ['pages', 'components'], {filename = 'zh_cn'}) => {
        getLang.getLang(pages, filename)
    })

program.command('writelang [src]')
    .description('将项目需要配置国际化的文件复制一份，并将文件中的中文替换成对应的key值，src为复制的文件目录, 默认为srcDist')
    .option('-f, --filename <filename>', '需要获取中文key值的文件，默认为 zh_cn.json')
    .option('-d, --dir <pages>', '需要替换的文件夹，默认为 pages 和 components', value => {
        return value.split(',')
    })
    .action((src = 'srcDist', pages = ['pages', 'components'], {filename = 'zh_cn.json'}) => {
        writeLang.writeLang(src, pages, filename)
    })

program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});
if (process.argv.length === 2) {
    program.help();
}

program.parse(process.argv);
