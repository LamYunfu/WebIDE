import { LocalBurnerNotifier } from './../local_burner_notifier/local_burner_notifier';
import { FileCompressor } from './../tools/file_compressor';
import * as http from "http";

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
import { UserInfo } from '../../data_center/user_info';
import { ProjectData } from "../../data_center/project_data";
import { Differ } from '../diff/diff';
export function bindCommandExecute(bind: interfaces.Bind) {
  bind(RunCommand)
    .toSelf()
    .inSingletonScope();
}



@injectable()
export class RunCommand {

  loginHostName = "kubernetes.tinylink.cn"
  loginPath = "/linklab/device-control-v2/login-authentication/user/login"
  commandPath = "device-control-v2/user-service/api/device/cmd"
  authorization: string = ""

    constructor(
        @inject(UserInfo) protected uif: UserInfo,
        @inject(CallInfoStorer) readonly cis: CallInfoStorer,
        @inject(LdcShellInterface) readonly ldcShell: LdcShellInterface,
    ) {

    }

    outputResult(mes: string, type: string = "sys") {
        this.ldcShell.outputResult(mes, type);
      }

    async run(//上传源代码到编译服务器
        command: string,
      ): Promise<string> {  
        console.log("run command: " + command);
        console.log("username is " + this.uif.username);
        let fm = new FormData();
        let parameters = {
          Authorization: this.authorization,
        };
        console.log(JSON.stringify(parameters));
        fm.append("parameters", JSON.stringify(parameters));
    
        let p = new Promise<string>((resolve) => {
          this.cis.storeCallInfoInstantly("start", CallSymbol.CCCE);
          let uf = http.request(
            {
              // protocol: "https:",
              method: "POST",
              host: this.loginHostName,
              path: this.commandPath,
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
                 
                  // this.lbn.notify("http://localhost:8827"+ `/linklab/compilev2/api/compile/block/status?filehash=${fha}&boardtype=${boardType}&compiletype=${compileType}`)
                  resolve("not_query")
                  return
                }
                let p;
                // this.lbn.notify("http://192.168.190.224:8827"+ `/download?filehash=${fha}&boardtype=${boardType}`)
                console.log("-----eeeee-----")
                this.cis.storeCallInfoInstantly("end", CallSymbol.CCCE);
                // resolve(
                //   (p = `/linklab/compilev2/api/compile/block/status?filehash=${fha}&boardtype=${boardType}&compiletype=${compileType}`)
                //   // b04f3ee8f5e43fa3b162981b50bb72fe1acabb33&boardtype=esp32devkitc&compiletype=alios
                // );
               
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
          uf.write(JSON.stringify({ "cmd": command, "id": "UserTest" }))
          uf.end()
        });
        
        return await p;
      }


      async queryCommandStatus(path: string, output: string,tag:boolean=false) {
        console.log("query compile status!")
        let p = new Promise<string>((resolve) => {
          console.log(p);
          this.cis.storeCallInfoInstantly("start", CallSymbol.DNHX);
          let gf = http.request(
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

    async runcommand(
        command: string,
      ): Promise<boolean> {

        let tag = await this.prepare()
        if (!tag) {
            this.outputResult(" User doesn't not login", "err")
        }
        let x = await this.run(command);
        if (x == "error") {
          return false;
        }
        else if (x == "not_query") {
          return true
        }
        // let qr = await this.queryCommandStatus(x, hexPath,tag);
        // if (qr == "scc") return true;
        // else return false;
      }


      async prepare() {
        if (this.authorization == "") {
            return await this.login()
        }
        return true;
    }


      async login() {
        return await new Promise((bk) => {
            let request = http.request(
                {
                    method: "POST",
                    hostname: this.loginHostName,
                    path: this.loginPath
                }
                ,
                (res) => {
                    let tmp: Buffer | undefined = undefined
                    res.on("data", (data) => {
                        if (tmp == undefined) {
                            tmp = data
                        } else {
                            tmp = Buffer.concat([tmp, data])
                        }
                    })
                    res.on("close", () => {
                        let raw = tmp!.toString()
                        let json = JSON.parse(raw);
                        if (json["code"] == 0) {

                            this.authorization = json["data"]["token"];
                            // this.outputResult(json["data"]["token"])
                            bk(true)
                        } else {
                            // this.outputResult(json["msg"])
                            bk(false)
                        }
                    })

                }
            )
            request.write(JSON.stringify({ "id": this.uif.username }))
            request.end()
        }
        )

        // fm.pipe(request)       
    }



}