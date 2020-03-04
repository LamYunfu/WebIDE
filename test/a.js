fs = require('fs')
a = fs.readFileSync(`/home/liang/webide/c`, {
    encoding: "base64"
})
let x = a.toString()
// var a = new Buffer("abcd", 'utf8')
console.log(new Buffer(a, "hex"))