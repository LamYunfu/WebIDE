import * as fs from "fs-extra";
// fs.createFileSync("d://a.x");
fs.writeFileSync("d://a.x", "abcdefdsaf");
let p = fs.readFileSync("d://a.x","base64");
console.log(`"${p.toString()}"`);
