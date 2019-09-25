// import { NewAliosCompiler } from './../compilers/new-alios-compiler';
// import * as http from 'http'
// import * as fs from 'fs-extra';
// import * as ach from 'archiver'
// import * as crypto from "crypto"
// import * as FormData from "form-data"
// describe('extractor', () => {
//     it("test", async () => {
//         let st = fs.createWriteStream(`/home/liang/load/liang.zip`) //打包
//         let achst = ach.create("zip").directory(`/home/project/串口打印(AliOS)/device`, false)
//         let hash = crypto.createHash("sha1")
//         let hashVal = ""
//         new Promise(resolve => {
//             st.on("close", () => {
//                 console.log('compress file scc')
//                 resolve("scc")
//             }
//             )
//         }).then((res) => {
//             if (res == "scc") {
//                 hash = crypto.createHash("sha1")
//                 let buff = new Buffer(fs.readFileSync(`/home/liang/load/liang.zip`))
//                 hashVal = hash.update(buff).digest("hex")
//                 return new Promise((resolve) => {
//                     let configRequest = http.request({//
//                         method: "POST",
//                         hostname: '47.97.253.23',
//                         port: '12305',
//                         path: "/config",

//                         headers: {
//                             'Content-Type': "application/json"
//                         }
//                     }, (mesg) => {
//                         let bf = ""
//                         mesg.on("data", (b: Buffer) => {
//                             bf += b.toString("utf8")
//                         })
//                         mesg.on("end", () => {
//                             let res: any = JSON.parse(bf)
//                             if (res.result) {
//                                 console.log("Alios Post Config SCC!")
//                                 resolve("scc")
//                             }
//                             else {
//                                 console.log("Alios Post Config Failed!")
//                             }
//                         })
//                     })
//                     configRequest.write(JSON.stringify({
//                         "examplename": "helloworld",
//                         "boardname": "esp32devkitc",
//                         "filehash": hashVal
//                     }))
//                     configRequest.end()

//                 })
//             }
//         }).then((res) => {
//             if (res == "scc") {
//                 console.log("start upload zip file")
//                 let fm = new FormData()
//                 return new Promise((resolve) => {
//                     let uploadRequest = http.request({//
//                         method: "POST",
//                         hostname: '47.97.253.23',
//                         port: '12305',
//                         path: "/upload",
//                         headers: {
//                             "Accept": "application/json",
//                             "Content-Type": "multipart/form-data;boundary=" + fm.getBoundary(),
//                         },
//                     }, (mesg) => {
//                         let bf = ""
//                         mesg.on("data", (b: Buffer) => {
//                             bf += b.toString("utf8")
//                         })
//                         mesg.on("end", () => {
//                             console.log(bf)
//                             let res: any = JSON.parse(bf)
//                             if (res.result) {
//                                 console.log("Alios Post Upload SCC!")
//                                 resolve("scc")
//                             }
//                             else {
//                                 console.log("Alios Post Upload Failed!")
//                             }
//                         })
//                     })
//                     let blob = fs.readFileSync("/home/liang/load/liang.zip")
//                     fm.append("file", blob, "install.zip")
//                     fm.pipe(uploadRequest)
//                 })
//             }
//         }).then(
//             (res) => {
//                 if (res == "scc") {
//                     console.log("start downloading")
//                     let downloadRequest = http.request({//
//                         method: "POST",
//                         hostname: '47.97.253.23',
//                         port: '12305',
//                         path: "/download",

//                         headers: {

//                             'Content-Type': "application/json"
//                         }
//                     }, (mesg) => {
//                         let ws = fs.createWriteStream(`/home/project/串口打印(AliOS)/hexFiles/${new Buffer(`串口打印(AliOS)`).toString("hex")}.hex`, {
//                         })
//                         mesg.on("data", (b: Buffer) => {
//                             console.log("downloading")
//                             ws.write(b)
//                         })
//                         mesg.on("end", () => {
//                             ws.close()
//                             console.log("download scc")

//                         })
//                     })
//                     downloadRequest.write(JSON.stringify({
//                         filehash: hashVal
//                     }))
//                     downloadRequest.end()

//                 }
//             }

//         )
//         achst.pipe(st)
//         achst.finalize()
//     })
//     it("ss",()=>{
//         let x = new NewAliosCompiler()  
//         x.getHexFile(`串口打印(AliOS)`,"device")
//     })
// })

