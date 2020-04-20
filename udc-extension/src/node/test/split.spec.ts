// // // let x = require('colors')
// import "reflect-metadata";
// import * as color from "colors";
// import * as http from "http";
// import * as FormData from "form-data";
// import { Logger } from "../util/logger";
// import * as fs from "fs";
// import * as path from "path";
// import * as ach from "archiver";
// import {
//   DistributedCompiler,
//   terminal,
// } from "../compilers/distributedcompiler";
// describe("a", () => {
//   it("adf", () => {
//     let x = JSON.parse(
//       `{"1234567890123456,/dev/tinylink_platform_1-75735303731351C04212":"0","1234567890123456,/dev/tinylink_platform_1-75735303731351C0421":"0"}`
//     );
//     let tmp = [];
//     for (let item of Object.keys(x)) {
//       let slices = item.split("/");
//       let res = slices[slices.length - 1].trim();
//       res != "" ? tmp.push(res) : "";
//     }
//     console.log("allocated devices:" + tmp.join(";"));
//   });
//   it("color", () => {
//     color.enable();
//     console.log("abc".black);
//   });
//   it("code", () => {
//     "0E12340E123".split("0E");
//     console.log(
//       "0E12340E123"
//         .split("0E")
//         .slice(1)
//         .join(";")
//     );
//   });
//   it("match", () => {
//     let x = "abc deX";
//     let a = x.match("c de");
//     console.log(a![0]);
//     expect(x).not.toBe(null);
//   });
//   it("key ", async () => {
//     let fm = new FormData();
//     Logger.info("uploading hex file");
//     return await new Promise(async (resolve) => {
//       let uploadRequest = http.request(
//         {
//           //传zip
//           method: "POST",
//           hostname: "47.96.155.111",
//           port: 12381,
//           path: "/api/system/linklab/compile",
//           headers: fm.getHeaders(),
//         },
//         (mesg) => {
//           if (mesg == undefined) {
//             console.log("network error");
//             Logger.info("error happened while upload");
//             resolve("err");
//             return;
//           }
//           let bf = "";
//           Logger.info("upload statuscode:" + mesg.statusCode);
//           mesg.on("data", (b: Buffer) => {
//             Logger.info("data comming");
//             bf += b.toString("utf8");
//           });
//           mesg.on("error", () => {
//             Logger.info("error happened while upload");
//             console.log("network error");
//             resolve("err");
//           });
//           mesg.on("end", () => {
//             Logger.info("bf:" + bf);
//             let res: any = JSON.parse(bf);
//             if (res["code"] == "200") {
//               resolve("scc");
//             } else {
//               console.log(res.msg);
//               resolve(res.msg);
//             }
//           });
//         }
//       );
//       uploadRequest.on("error", () => {
//         console.log("network error");
//         resolve("err");
//       });
//       // let blob = fs.readFileSync(filepath)
//       let filepath = "./TinyEdge.zip";
//       let st = fs.createReadStream(filepath);
//       Logger.info("append file");
//       fm.append("file", st, filepath.split("/").pop());
//       fm.append("userName", "emmtest");
//       fm.pipe(uploadRequest);
//       Logger.info("file append ok");
//     });
//   });

//   it("tag", async () => {
//     let st = fs.createWriteStream(path.join("./cde.zip")); //打包
//     let achst = ach
//       .create("zip")
//       .directory("./Custom", "TinyEdge/Custom")
//       .directory("./Development", "TinyEdge/Development");
//     new Promise((resolve) => {
//       st.on("close", () => {
//         console.log("compress file scc");
//         resolve("scc");
//       });
//     });
//     achst.pipe(st);
//     achst.finalize();
//   });
//   it("arc", async () => {
//     jest.setTimeout(122222)
//     let dc = new DistributedCompiler(new terminal());
//     await dc.compile(
//       path.join(__dirname, "alios"),
//       path.join(__dirname, "x.hex"),
//       "esp32devkitc",
//       "alios"
//     );
//   });
// });
