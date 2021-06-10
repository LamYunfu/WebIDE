import { message } from 'antd';
import { LocalBurnerNotifier } from './../local_burner_notifier/local_burner_notifier';
import { FileCompressor } from './../tools/file_compressor';
import * as Hs from "http";

import * as FormData from "form-data";
import * as Arc from "archiver";
import * as Fs from "fs-extra";
import * as Path from "path";
import * as Ha from "crypto";
import { inject, injectable, interfaces } from "inversify";
import { CallInfoStorer } from "../log/call_info_storer";
import { CallSymbol } from "../../../setting/callsymbol";
import { DISTRIBUTEDCOMPILER_IP } from "../../../setting/backend-config";
import { LdcShellInterface } from "../ldc_shell/interfaces/ldc_shell_interface";
import { ProjectData } from "../../data_center/project_data";
import { Differ } from '../diff/diff';
import { ResearchNotifier } from './research_notifier';
export function bindDistributedCompiler(bind: interfaces.Bind) {
  bind(DistributedCompiler)
    .toSelf()
    .inSingletonScope();
}
@injectable()
export class DistributedCompiler {
  //   constructor(@inject(UdcTerminal) readonly udc: UdcTerminal) {}
  constructor(
    @inject(LdcShellInterface) readonly ldcShell: LdcShellInterface,
    @inject(CallInfoStorer) readonly cis: CallInfoStorer,
    @inject(ProjectData) readonly projectData: ProjectData,
    @inject(FileCompressor) readonly fileCompressor: FileCompressor,
    @inject(LocalBurnerNotifier) readonly lbn:LocalBurnerNotifier,
    @inject(Differ) readonly diff:Differ,
    @inject(ResearchNotifier) readonly rn :ResearchNotifier
  ) { }
  outputResult(mes: string, type: string = "sys") {
    this.ldcShell.outputResult(mes, type);
  }
  fileUrl=""
  uploadToCompiler(){

  }
  async upload(//上传源代码到编译服务器
    path: string,
    boardType: string,
    compileType: string,
    projectIndex: string,
    tag:boolean
  ): Promise<string> {  
    console.log("---compile:" + path)
    let ha = Ha.createHash("sha1");
    let tp =await this.archiveFile(path);
    let fileData = Fs.readFileSync(tp);
    ha.update(fileData);
    let fha = ha.digest("hex");
    let fhas = this.projectData.fileHash;
    fhas[parseInt(projectIndex)] = fha;
    this.projectData.fileHash = fhas;

    let fileDataZip = this.projectData.pythonFileData;
    fileDataZip[parseInt(projectIndex)] = fileData;
    this.projectData.pythonFileData = fileDataZip;
    if(this.projectData.language == "python") {
      return;
    }
    let fm = new FormData();
    let parameters = {
      filehash: fha,
      boardType: boardType,
      compileType: compileType,
    };
    console.log(JSON.stringify(parameters));
    fm.append("parameters", JSON.stringify(parameters));
    fm.append("file", fileData, "file.zip");

    let p = new Promise<string>((resolve) => {
      this.cis.storeCallInfoInstantly("start", CallSymbol.CCCE);
      let uf = Hs.request(
        {
          // protocol: "https:",
          method: "POST",
          host: DISTRIBUTEDCOMPILER_IP,
          path: "/linklab/compilev2/api/compile",
          headers: fm.getHeaders(),
          // auth: "api_gateway:api_gateway",
        },
        (res) => {
          let x: Buffer[] = [];
          res.on("data", (buffer: Buffer) => {
            x.push(buffer);
          });
          res.on("close", () => {
            let data = x;
            let ob = JSON.parse(data.toString());
            console.log(data.toString());
            if (ob["code"] == "-1") {
              this.outputResult(ob["msg"],"error");
              this.cis.storeCallInfoInstantly(ob["msg"], CallSymbol.CCCE, 1);
              resolve("error");
              return 
            }
            if (ob["msg"] == "error") {
              this.outputResult(ob["data"]["message"],"error");
              this.cis.storeCallInfoInstantly(
                ob["data"]["message"],
                CallSymbol.CCCE,
                1
              );
              resolve("error");
              return 
            }
            else if (ob["msg"] == "completed") {
              console.log("-----entry-----")
              this.cis.storeCallInfoInstantly("end", CallSymbol.CCCE);
              // this.lbn.notify("http://192.168.190.224:8827"+ `/download?filehash=${fha}&boardtype=${boardType}`)
              this.outputResult("Compile scc");
              if(tag){
                this.lbn.notify(`/download?filehash=${fha}&boardtype=${boardType}&compiletype=${compileType}`)
                let url= `http://${DISTRIBUTEDCOMPILER_IP}/linklab/compilev2/api/compile/block?filehash=${fha}&boardtype=${boardType}&compiletype=${compileType}`
                this.rn.setURL(url)
                let xx={
                  code:0,
                  message:"ok",
                  data:{
                    url:url
                  }

                }
                this.lbn.notify(JSON.stringify(xx))
              }
             
              // this.lbn.notify("http://localhost:8827"+ `/linklab/compilev2/api/compile/block/status?filehash=${fha}&boardtype=${boardType}&compiletype=${compileType}`)
              resolve("not_query")
              return
            }
            let p;
            if(tag){
              this.lbn.notify(`/download?filehash=${fha}&boardtype=${boardType}&compiletype=${compileType}`)
            }
            // this.lbn.notify("http://192.168.190.224:8827"+ `/download?filehash=${fha}&boardtype=${boardType}`)
            console.log("-----eeeee-----")
            this.cis.storeCallInfoInstantly("end", CallSymbol.CCCE);
            resolve(
              (p = `/linklab/compilev2/api/compile/block/status?filehash=${fha}&boardtype=${boardType}&compiletype=${compileType}`)
              // b04f3ee8f5e43fa3b162981b50bb72fe1acabb33&boardtype=esp32devkitc&compiletype=alios
            );
           
            console.log(p);
          });
        }
      );
      uf.on("error", () => {
        this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.CCCE, 1);
        resolve("error");
      });
      fm.pipe(uf);
    });
    return await p;
  }
  async archiveFile( path: string){//打包源代码
      let tp = Path.join(this.fileCompressor.generateTempFilePath());
      if(this.projectData.modifyOSCore){
        await this.diff.getZipFile(path,tp)
      }else{
        console.log("------tp:" + tp)
        console.log("arcfile:" + tp);
        let ws = Fs.createWriteStream(tp, { encoding: "binary" });
        let ps = new Promise<void>((res) => {
          ws.on("close", () => {
            res();
          });
        });
        let arc = Arc.create("zip");
        arc.directory(path, "/");
        arc.pipe(ws);
        await arc.finalize();
        await ps;
      }  
      return tp
  }
  async waitCompileFinish(path: string, output: string) {
    let p = new Promise<string>((resolve) => {
      console.log(p);
      this.cis.storeCallInfoInstantly("start", CallSymbol.WTCP);
      let gf = Hs.request(
        {
          // protocol: "https:",
          method: "GET",
          host: DISTRIBUTEDCOMPILER_IP,
          path: path,
          // auth: "api_gateway:api_gateway",
        },
        (response) => {
          let x: Buffer[] = [];
          response.on("data", (buffer: Buffer) => {
            if (x.length % 10000) console.log("downloading");
            x.push(buffer);
            // 1fcdcf2d5e70667153909264038ccf19461e553d
          });
          response.on("close", () => {
            let bf = Buffer.concat(x);
            let ob = JSON.parse(bf.toString());
            if (ob["msg"] == "completed") {
              
              this.cis.storeCallInfoInstantly("end", CallSymbol.WTCP);
              resolve("scc");
            } else {
              this.outputResult(ob["data"]["message"], "err");
              this.cis.storeCallInfoInstantly(
                "compiler error",
                CallSymbol.WTCP,
                1
              );
              resolve("error");
            }
          });
        }
      );
      gf.on("error", () => {
        this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.WTCP, 1);
        resolve("error");
      });
      gf.end();
    });
    return await p;
  }
  async queryCompileStatus(path: string, output: string,tag:boolean=false) {
    console.log("query compile status!")
    let p = new Promise<string>((resolve) => {
      console.log(p);
      this.cis.storeCallInfoInstantly("start", CallSymbol.DNHX);
      let gf = Hs.request(
        {
          // protocol: "https:",
          method: "GET",
          host: DISTRIBUTEDCOMPILER_IP,
          path: path,
          // auth: "api_gateway:api_gateway",
        },
        (response) => {
          let x: Buffer[] = [];

          response.on("data", (buffer: Buffer) => {
            if (x.length % 10000) console.log("downloading");
            x.push(buffer);
          });
          response.on("close", () => {
            let bf = Buffer.concat(x);
            console.log(bf.toString());
            let ob = JSON.parse(bf.toString());
            if (ob["msg"] == "completed") {
              this.outputResult("Compile scc");
              if(tag){
                this.lbn.notify(path)
              }
              this.cis.storeCallInfoInstantly("end", CallSymbol.DNHX);
              resolve("scc");
            } else {
              this.outputResult(ob["data"]["message"], "err");
              this.cis.storeCallInfoInstantly(ob["msg"], CallSymbol.DNHX, 1);
              resolve("error");
            }
          });
        }
      );
      gf.on("error", () => {
        this.outputResult(
          "Network error!\nYou can check your network connection and retry.",
          "err"
        );
        this.cis.storeCallInfoInstantly("broken network", CallSymbol.DNHX, 1);
        resolve("error");
      });
      gf.end();
    });
    return await p;
  }
  async compile(
    path: string,
    hexPath: string,
    boardType: string,
    compileType: string,
    projectIndex: string,
    tag:boolean =false
  ): Promise<boolean> {
    let x = await this.upload(path, boardType, compileType, projectIndex,tag);
    if(this.projectData.language == "python") {
      return true;
    }
    if (x == "error") {
      return false;
    }
    else if (x == "not_query") {
      return true
    }
    let qr = await this.queryCompileStatus(x, hexPath,tag);
    if (qr == "scc") return true;
    else return false;
  }
}
