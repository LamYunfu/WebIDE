//file is deprecated
import { Logger } from "./logger";
import { Extractor } from "./extractor";
import { FileMapper } from "./filemapper";
import { UdcTerminal } from "./udc-terminal";
import { injectable, inject } from "inversify";
import { hexFileDir, getCompilerType } from "../globalconst";
import * as path from "path";
import * as http from "http";
import * as fs from "fs-extra";
import * as crypto from "crypto";
import * as FormData from "form-data";
import {
  PROGRAM_SERVER_IP,
  PROGRAM_SERVER_PORT,
  RootDirPath,
} from "../../setting/backend-config";
import { CallInfoStorer } from "./callinfostorer";
import { CallSymbol } from "../../setting/callsymbol";
// import { networkInterfaces } from 'os';
@injectable()
export class Programer {
  constructor(
    @inject(UdcTerminal) protected readonly ut: UdcTerminal,
    @inject(FileMapper) protected readonly fm: FileMapper,
    @inject(Extractor) protected readonly et: Extractor,
    @inject(RootDirPath) public rootDir: RootDirPath,
    @inject(CallInfoStorer) readonly cis: CallInfoStorer
  ) {}
  async fileUpload(filepath: string) {
    let _this = this;
    let uploadResult = "scc";
    let gHash = "";
    let configResult = await new Promise((resolve) => {
      Logger.info("configuring burning program");
      let hash = crypto.createHash("sha1");
      let buff = fs.readFileSync(filepath);
      // let hashVal = hash.update(buff).digest("hex")
      let hashVal = hash.update(buff).digest("hex");
      gHash = hashVal;
      Logger.info("hex hashval:" + hashVal);
      this.cis.storeCallInfoInstantly("start", CallSymbol.IPCF);
      let configRequest = http.request(
        {
          //
          method: "POST",
          hostname: PROGRAM_SERVER_IP,
          port: "8081",
          path: "/config",
          headers: {
            "Content-Type": "application/json",
          },
        },
        (mesg) => {
          if (mesg == undefined) {
            _this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
            Logger.info("error happened while config");
            resolve("err");
            this.cis.storeCallInfoInstantly(
              "error back value",
              CallSymbol.IPCF,
              1
            );
            return;
          }
          let bf = "";
          mesg.on("error", (err) => {
            _this.ut.outputResult(
              "something error happened when configuring burning."
            );
            Logger.info(err, "config");
            resolve("err");
          });
          mesg.on("data", (b: Buffer) => {
            bf += b.toString("utf8");
          });
          mesg.on("end", () => {
            Logger.info("bf:" + bf);
            let res: any = JSON.parse(bf);
            if (!res.result) {
              Logger.info("Initializing burning tools successful!");
              _this.ut.outputResult("Initializing burning tools successful!");
              Logger.info(res.status);
              this.cis.storeCallInfoInstantly("end", CallSymbol.IPCF);
              resolve("scc");
            } else {
              Logger.info(res.status); //已经存在
              this.cis.storeCallInfoInstantly("end", CallSymbol.IPCF);
              resolve("exist");
            }
          });
        }
      );
      configRequest.on("error", () => {
        _this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
        Logger.info("error happened while config");
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.IPCF, 1);
        resolve("err");
        return;
      });
      configRequest.write(
        JSON.stringify({
          filehash: hashVal,
        })
      );
      configRequest.end();
    });

    if (configResult == "scc") {
      let fm = new FormData();
      Logger.info("uploading hex file");
      this.cis.storeCallInfoInstantly("start", CallSymbol.FLUP);
      uploadResult = await new Promise(async (resolve) => {
        let uploadRequest = http.request(
          {
            //传zip
            method: "POST",
            hostname: PROGRAM_SERVER_IP,
            port: PROGRAM_SERVER_PORT,
            path: "/upload",
            // headers: {
            //     "Accept": "application/json",
            //     "Content-Type": "multipart/form-data;boundary=" + fm.getBoundary(),
            // },
            headers: fm.getHeaders(),
          },
          (mesg) => {
            if (mesg == undefined) {
              _this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
              Logger.info("error happened while upload");
              resolve("err");
              return;
            }
            let bf = "";
            Logger.info("upload statuscode:" + mesg.statusCode);
            mesg.on("data", (b: Buffer) => {
              Logger.info("data comming");
              bf += b.toString("utf8");
            });
            mesg.on("error", (err) => {
              _this.ut.outputResult(
                "something error happened when uploading binary file."
              );

              Logger.info(err, "upload");
              resolve("err");
            });
            mesg.on("end", () => {
              Logger.info("bf:" + bf);
              let res: any = JSON.parse(bf);
              if (res.result) {
                this.cis.storeCallInfoInstantly("end", CallSymbol.FLUP);
                this.ut.outputResult("Uploading source file to compiler successful!");
                resolve("scc");
              } else {
                _this.ut.outputResult(res.msg);
                this.cis.storeCallInfoInstantly(res.msg, CallSymbol.FLUP, 1);
                resolve(res.msg);
              }
            });
          }
        );
        uploadRequest.on("error", () => {
          _this.ut.outputResult("Network error!\nYou can check your network connection and retry.","err");
          this.cis.storeCallInfoInstantly("broken network", CallSymbol.FLUP, 1);
          Logger.info("error happened while upload");
          resolve("err");
          return;
        });
        let st = fs.createReadStream(filepath);
        Logger.info("append file");
        // fm.append("file", blob, filepath.split("/").pop())
        fm.append("file", st, filepath.split("/").pop() + ".hex");
        fm.pipe(uploadRequest);
        Logger.info("file append ok");
      });
    } else {
      // _this.outputResult("file exist ")
    }

    if (uploadResult != "scc") {
      Logger.info("uploading binary file error");
      _this.ut.outputResult("Uploading source file to compiler failed!","err");
      return "err";
    } else {
      // Logger.info("uploading zip file scc")
      // _this.ut.outputResult("hexfile upload success")
      return gHash;
    }
  }
  getHexName(fn: string) {
    return new Buffer(fn).toString("hex");
  }
  async freeCodingProgram(pid: string) {
    Logger.info("use freecodingprogram", "/");
    let { dirName } = this.ut.pidQueueInfo[pid];
    let projects: any[] = this.ut.freeCodingConfig["projects"];
    // this.ut.outputResult(JSON.stringify(this.ut.freeCodingConfig))
    let hexFileDir = this.ut.freeCodingConfig["hexFileDir"];
    let absHexFileDir = path.join(this.ut.rootDir.val, dirName, hexFileDir);
    let deviceUsage = this.ut.freeCodingConfig["deviceUsage"];
    let burnOption: any = {};
    deviceUsage == "QUEUE"
      ? this.ut.outputResult("Entered multiplexed compiling mode. Queuing...")
      : this.ut.outputResult("Entered exclusive compiling mode...");
    burnOption = {
      ...burnOption,
      type: deviceUsage,
      pid: pid,
      groupId: (
        Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) +
        Math.pow(10, 15)
      ).toString(),
      program: [],
    };
    try {
      let option: any[] = [];
      for (let item of projects) {
        let projectBurningSetting =
          deviceUsage == "QUEUE"
            ? item["burningDataQueue"]["program"]
            : item["burningDataAdhoc"]["program"];
        projectBurningSetting["model"] = item["deviceType"];
        //处理直接提交代码
        if (item["compilationMethod"] == "none") {
          Logger.info("without compile");
          let srcDir = path.join(
            this.rootDir.val,
            dirName,
            item["projectName"]
          );
          for (let val of fs.readdirSync(srcDir)) {
            let hash = await this.fileUpload(path.join(srcDir, val));
            option.push({
              filehash: hash,
              waitingId: (
                Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) +
                Math.pow(10, 15)
              ).toString(),
              ...projectBurningSetting,
            });
            Logger.info("option：" + JSON.stringify(option));
          }
        } else {
          let absHexPath = path.join(
            absHexFileDir,
            "B" + this.getHexName(item["projectName"]) + "sketch.ino.hex"
          );
          if (!fs.existsSync(absHexPath))
            absHexPath = path.join(
              absHexFileDir,
              this.getHexName(item["projectName"]) + ".hex"
            );
          let filehash = await this.fileUpload(absHexPath);
          // absHexPath = path.join(absHexFileDir, this.getHexName(item["projectName"]) + "sketch.ino.hex")
          if (filehash == "err") return "err";
          console.log(JSON.stringify(option));
          option.push({
            filehash: filehash,
            waitingId: (
              Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) +
              Math.pow(10, 15)
            ).toString(),
            ...projectBurningSetting,
          });

          console.log(JSON.stringify(option));
        }
      }
      burnOption["program"] = option;
      console.log("burning option :" + JSON.stringify(burnOption));
      return await this.ut.program_device(pid, JSON.stringify(burnOption));
    } catch (e) {
      console.log(e);
      this.ut.outputResult("config.json is incorrect!\nPlease check it or restore it to default!","err");
      return;
    }
  }
  async program(pid: string) {
    let {
      loginType,
      fns,
      dirName,
      model,
      deviceRole,
      // waitID,
      timeout,
    } = this.ut.getPidInfos(pid);
    let address = model == "developer_kit" ? "0x08000000" : "0x10000";
    let devArr = [];
    let fnArr = JSON.parse(fns);
    if (getCompilerType(model) == "alios") fnArr = deviceRole;
    let devInfo: { [devid: string]: number } | undefined;
    for (let i = 4; ; i--) {
      devInfo = this.ut.get_devlist();
      if (devInfo != undefined) {
        break;
      }
      if (i == 0) {
        return "fail";
      }
      Logger.info("waitting for allocate device");
      await new Promise((res) => {
        setTimeout(() => {
          res();
        }, 1000);
      });
    }
    for (let item in this.ut.get_devlist()) {
      devArr.push(item);
    }
    let hex = this.fm.getFileNameMapper(pid);
    Logger.info("mapper:" + JSON.stringify(hex));
    if (typeof hex == "string") {
      Logger.info("error file name map");
      return "fail";
    }
    let arr: Object[] = [];
    let setJson = {
      type: "QUEUE",
      groupId: (
        Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) +
        Math.pow(10, 15)
      ).toString(),
      pid: pid,
      program: arr,
    };
    Logger.info("sending file to LDC......");
    switch (loginType) {
      case "queue": {
        for (let item of deviceRole!) {
          let hexFile = hex[item.split(".")[0]];
          console.log(
            "path:" + [this.rootDir.val, dirName, hexFileDir, hexFile].join(";")
          );
          let hash = await this.fileUpload(
            path.join(this.rootDir.val, dirName, hexFileDir, hexFile)
          );
          if (hash == "err") return false;
          // break
          setJson["program"].push({
            model: model,
            waitingId: (
              Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) +
              Math.pow(10, 15)
            ).toString(),
            runtime: timeout,
            address: address,
            filehash: hash,
          });
        }
        return await this.ut.program_device(pid, JSON.stringify(setJson));
      }
      case "adhoc": {
        for (let item of deviceRole!) {
          console.log("fnArr:" + fnArr.join(";"));
          let hexFile = hex[item.split(".")[0]];
          console.log(item + ":hexFile:" + JSON.stringify(hex));
          console.log(
            "path:" + [this.rootDir.val, dirName, hexFileDir, hexFile].join(";")
          );
          let hash = await this.fileUpload(
            path.join(this.rootDir.val, dirName, hexFileDir, hexFile)
          );
          if (hash == "err") return false;
          setJson["program"].push({
            model: model,
            waitingId: (
              Math.floor(Math.random() * (9 * Math.pow(10, 15) - 1)) +
              Math.pow(10, 15)
            ).toString(),
            runtime: timeout,
            address: address,
            filehash: hash,
          });
        }
        // setJson['program']=setJson['program'].reverse()
        return await this.ut.program_device(pid, JSON.stringify(setJson));
      }
      case "group": {
        let fnArr: string[] = [];
        if (deviceRole == undefined) return false;
        else fnArr = deviceRole;
        // let devIndex: any = -1
        let devStr = "";
        let lastStr = "";
        for (let index in fnArr) {
          for (let seq in devArr) {
            if (
              devArr[seq].split("lora").length > 1 &&
              devArr[seq].split(",")[1].split("|")[0] != lastStr
            ) {
              // devIndex = seq
              lastStr = devArr[seq].split(",")[1].split("|")[0];
              // this.ut.outputResult(lastStr)
              devStr = devArr[seq];
              break;
            }
          }
          let hexFile = hex[fnArr[index].split(".")[0]];
          console.log(
            "path:" + [this.rootDir.val, dirName, hexFileDir, hexFile].join(";")
          );
          // let bv = await this.ut.program_device_group(path.join(this.rootDir.val, dirName, hexFileDir, hexFile), address, devArr[index], pid)
          let bv = await this.ut.program_device_group(
            path.join(this.rootDir.val, dirName, hexFileDir, hexFile),
            address,
            devStr,
            pid
          );
          if (bv == false) {
            return false;
          }
        }
        break;
      }
    }
    return true;
  }
  async programSingleFile(pid: string, fn: string) {
    //提交单个文件，适用场景编程
    let { dirName, model } = this.ut.getPidInfos(pid);

    let address = model == "developer_kit" ? "0x08000000" : "0x10000";
    // let { fns, dirName } = this.ut.getPidInfos(pid)
    let devArr = [];
    // let fnArr: string[] = JSON.parse(fns)
    let devInfo: { [devid: string]: number } | undefined;
    for (let i = 4; ; i--) {
      devInfo = this.ut.get_devlist();
      if (devInfo != undefined) {
        break;
      }
      if (i == 0) {
        this.ut.outputResult("can't get device info,retry latter");
        return "fail";
      }
      Logger.info("waiting for allocate device");
      await new Promise((res) => {
        setTimeout(() => {
          res();
        }, 1000);
      });
    }
    for (let item in this.ut.get_devlist()) {
      devArr.push(item);
    }
    let hex = this.fm.getFileNameMapper(pid);
    if (typeof hex == "string") {
      Logger.info("error file name map");
      return "fail";
    }
    let hexFile = hex[fn.split(".")[0]];
    // let index = fnArr.findIndex((val) => {
    //     if (val.match(`${fn}|${fn}.cpp`))
    //         return true
    // })
    // let bv = await this.ut.program_device(path.join(this.rootDir.val, dirName, hexFileDir, hexFile), address, devArr[index], pid)
    let hash = await this.fileUpload(
      path.join(this.rootDir.val, dirName, hexFileDir, hexFile)
    );
    if (hash == "err") return false;
    let bv = await this.ut.program_device_scene(
      path.join(this.rootDir.val, dirName, hexFileDir, hexFile),
      address,
      devArr[0],
      pid
    );
    if (bv == false) {
      return false;
    }
  }
}
