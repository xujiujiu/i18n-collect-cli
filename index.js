#!/usr/bin/env node

const program = require('commander')
// const child_process = require('child_process')

// child_process.execFile('node', ['--version'], function(error, stdout, stderr){
//     if(error){
//         throw error;
//     }
// });

program.version(require('./package').version)
