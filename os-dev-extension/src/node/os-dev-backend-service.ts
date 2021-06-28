import { inject, injectable} from "inversify";
import { BackendClient, OSdevBackendService} from "../common/protocol";
import * as path from "path";
import * as fs from "fs-extra";
import * as shell from "shelljs";
//import * as child_process from "child_process";
import * as http from "http";
import {ROOTPATH} from "udc-extension/lib/setting/backend-config";
import * as FormData from "form-data";
//import * as Arc from "archiver";
//import * as Path from "path";
import * as Ha from "crypto";
//import { OS } from "@theia/core";
import { LdcShellInterface } from "udc-extension/lib/node/services/ldc_shell/interfaces/ldc_shell_interface"
import { Indicator } from 'udc-extension/lib/node/services/indicator/indicator';
import {
  ProgramBurnDataFactory,
  //AdhocBurnElem,
  QueueBurnElem,
} from "udc-extension/lib/node/data_center/program_data";
import { LdcClientControllerInterface } from "udc-extension/lib/node/services/ldc/interfaces/ldc_client_controller_interface";
import { OS } from "@theia/core";
import * as Path from "path";
import * as Arc from "archiver";
//import { id } from "rhea";
//import URI from "@theia/core/lib/common/uri";

//import URI from "@theia/core/lib/common/uri";

@injectable()
export class OSdevBackendServiceImpl implements OSdevBackendService {
    testReturnWord(): string { 
      console.log("不是已经调用了吗？怎么会显示不出来呢？");
      this.downLoadSingleFile("test1", "test2");
      return "测试方法调用成果";
    }
   
    constructor(
      @inject(LdcShellInterface) readonly ldcShell: LdcShellInterface,
      @inject(Indicator) protected waitingIndicator: Indicator,
      @inject(ProgramBurnDataFactory) protected programBurnDataFactory: ProgramBurnDataFactory,
      @inject(LdcClientControllerInterface) protected lcc: LdcClientControllerInterface,
    ) { }
    client : BackendClient;
    protected _rootDir:string = "";
    protected os_name:string = "";
    protected os_version:string = "";
    protected _config:any = null;
    protected _filehash:any = "";

    outputResult(mes: string, type: string = "sys") {
      this.ldcShell.outputResult(mes, type);
    }

    async createProject(jsonFile: string, otherConfig:string) : Promise<boolean> {
        let config = JSON.parse(JSON.parse(jsonFile));
        console.log(config);
        //let pageConfig = JSON.parse(jsonFile);
        let folderName:string = config.projects[0].projectName;
        //拼接文件夹路径
        let tmp = path.join(ROOTPATH, "SystemDev");
        fs.existsSync(tmp) ? "" : fs.mkdirSync(tmp);
        let uri = path.join(tmp, folderName);
        //console.log("路径是：" + uri);
        //创建文件夹
        if(fs.existsSync(uri)){
          return false; 
        }
        fs.existsSync(uri) ? "" : fs.mkdirSync(uri);
        //新建配置文件config.json
        this._rootDir = uri.toString();
        this._config = JSON.parse(jsonFile);
        let configJsonUri = path.join(uri, "config.json");
        //将配置json内容jsonFile,存储起来，放在新建文件config.json内
        if(fs.existsSync(configJsonUri)){
            fs.removeSync(configJsonUri);
        }
        //以美化的方式写入json配置文件
        fs.writeFileSync(configJsonUri, JSON.stringify(config, null, "\t"));
        //从模板服务器下载文件目录
        await this.downLoadFileStructure(uri, config.osType, config.branch);
        //从模板服务器上下载所有的.git文件
        // let git_uri = path.join(uri, ".git");
        // await this.downLoadGit(git_uri, config.osType, config.branch);
        //打开调用前端方法文件夹工作空间，在右边显示
        uri.replace(/\\/g,"\/");
        this.client.openWorkSpace(uri);
        //打开文件视图 
        this.client.openExplore();
        //初始化项目
        // shell.cd(this._rootDir);
        // await shell.exec("git init");
        // await shell.exec("git add .");
        // await shell.exec(`git commit -m "start project"`);
        
        return true;
    }

    /**
     * 下载文件路径中的.git文件夹下面的所有文件
     * @param rootDir 
     * @param os_name 
     * @param os_version 
     */
    async downLoadGit(rootDir:any, os_name:string, os_version:string){
        if(fs.lstatSync(rootDir).isFile()){
            //如果是文件，那就从服务器上下载这个文件
            await this.downLoadGitFile(rootDir, os_name, os_version);
        }else{
          //否则继续遍历这个文件夹下面的子文件
          let data = fs.readdirSync(rootDir);
          for(let i = 0;i < data.length;i++){
            await this.downLoadGit(path.join(rootDir,data[i]), os_name, os_version);
          }
        }
    }


    /**
     * 从模板服务器中下载操作系统库文件结构
     * @param rootDir 本地文件根路径
     * @param os_name 操作系统名称
     * @param os_version 操作系统版本号
     */
    async downLoadFileStructure(rootDir:any, os_name:string, os_version:string){
        this.os_name = os_name;
        this.os_version = os_version;

        let param_post = {"name":"stm32_gcc", "version":"stm32-std"};
        param_post["name"] = os_name;
        param_post["version"] = os_version;
        //console.log("根路径名称是：" + this.rootDir);
       // console.log("最后生成的发送json字符串是：" + JSON.stringify(param_post));
        return await new Promise<boolean>((resolve) => {
              let fileRequest = http.request(
                {
                  method: "POST",
                  hostname: "judge.test.tinylink.cn",
                  ///
                  path: "/library/structure",
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
                (mesg) => {
                  if (mesg == undefined) {
                    return;
                  }
                  let bf = "";
                  mesg.on("data", (b: Buffer) => {
                    bf += b.toString("utf8");
                  });
                  mesg.on("error", () => {
                    console.log("向服务器请求错误");
                    resolve(false);
                  });
                  mesg.on("end", async () => {
                    let res: any = JSON.parse(bf);
                  //  console.log("从模板服务器返回的数据是：");
                  //  console.log(res);
                    if (res.result == 'true') {
                        //console.log("获取的数据是：" + JSON.stringify(res.template));
                        await this.createFileStructure(res.structure, rootDir);
                        resolve(true);
                    } else {
                      console.log(res.mes);
                      resolve(false);
                    }
                  });
                }
              );
              fileRequest.on("error", () => {
                resolve(false);
              });
              fileRequest.write(
                JSON.stringify(param_post)
              );
              fileRequest.end();
            } 
        );
    }

    /**
     * 根据服务器返回的数据递归创建文件目录结构
     * @param data_raw 原始数据
     * @param rootDir 本次创建的源地址
     */
    async createFileStructure(data_raw:any, rootDir:string){
     //   console.log("根目录是：" + rootDir);
        for(var key in data_raw){
            //console.log("json数据的key为 " + key + " value为： " + data_raw[key]);
            let new_uri = path.join(rootDir, key);
            if(data_raw[key]){
                //console.log("新的根目录是：" + new_uri);
                fs.mkdirSync(new_uri);
                this.createFileStructure(data_raw[key], new_uri);
            }else{
                //console.log("要生成的文件名称是：" + new_uri);
                fs.writeFileSync(new_uri, "");
            }
        }
    }


    /**
     * 从服务器根据字符串下载.git目录下的单个文件
     * @param file_path 文件的路径
     * @param uri 文件的完整路径
     */
     async downLoadGitFile(file_path:string, os_name:string, os_version:string){
      let param_post = {"name":"stm32_gcc", "version":"stm32-std", "path":"test.c"};
      console.log("git初始路径是：" + file_path);
      let fileDir:string = "";
      let a = file_path.toString().indexOf("SystemDev");
      let b = file_path.indexOf("\\", a+1);
      let c = file_path.indexOf("\\", b+1);
      fileDir = file_path.toString().substr(c+1).replace(/\\/g,"\/");   
      //split("\\").join("/");
      console.log("git下载路径是" + fileDir);

      param_post["path"] = fileDir;
      
      //组装请求参数
      param_post["name"]= os_name;
      param_post["version"] = os_version;
      console.log("最后生成的发送json字符串是：" + JSON.stringify(param_post));
      return await new Promise<boolean>((resolve) => {
          let fileRequest = http.request(
            {
              method: "POST",
              hostname: "judge.test.tinylink.cn",
              ///
              path: "/library/searchfile",
              headers: {
                "Content-Type": "application/json",
              },
            },
            (mesg) => {
              if (mesg == undefined) {
                return;
              }
              let bf = "";
              mesg.on("data", (b: Buffer) => {
                bf += b.toString("utf8");
              });
              mesg.on("error", () => {
                console.log("向服务器请求错误");
                resolve(false);
              });
              mesg.on("end", async () => {
                let res: any = JSON.parse(bf);
                //console.log("从搜索文件服务器返回的数据是：");
                //console.log(res);
                if (res.result == 'true') {
                    //console.log("获取的数据是：" + JSON.stringify(res.file));
                    //console.log("文件路径是：" + file_dir);
                    fs.writeFileSync(file_path, res.file);
                    //await shell.exec(`git add ${file_dir}`);
                    resolve(true);
                } else { 
                  console.log(res.mes);
                  resolve(false);
                }
              });
            }
          );
          fileRequest.on("error", () => {
            resolve(false);
          });
          fileRequest.write(
            JSON.stringify(param_post)
          );
          fileRequest.end();
        } 
    );
  }
  
    /**
     * 从服务器根据字符串下载单个文件
     * @param file_path 文件的路径
     * @param uri 文件的完整路径
     */
    async downLoadSingleFile(file_path:string, uri:string){
        let param_post = {"name":"stm32_gcc", "version":"stm32-std", "path":"test.c"};
        param_post["path"] = file_path;
        //从config.json中获取库的名称和分支信息
        let root_dir = uri.substr(8);
        let file_dir = root_dir;
        //console.log("目录是：" + root_dir);
        let a = root_dir.indexOf("SystemDev\\");
        let b = root_dir.indexOf("/", a+1)
        root_dir = root_dir.substr(0,b);
        let config_path = path.join(root_dir, "config.json");
        console.log("文件根目录是：" + config_path);
        //读取config.json文件中的内容，获取库信息和版本信息
        let config_json = fs.readFileSync(config_path);
        let config:any = JSON.parse(config_json.toString());
        
        //组装请求参数
        param_post["name"]= config.osType;
        param_post["version"] = config.branch;
        console.log("最后生成的发送json字符串是：" + JSON.stringify(param_post));
        return await new Promise<boolean>((resolve) => {
            let fileRequest = http.request(
              {
                method: "POST",
                hostname: "judge.test.tinylink.cn",
                ///
                path: "/library/searchfile",
                headers: {
                  "Content-Type": "application/json",
                },
              },
              (mesg) => {
                if (mesg == undefined) {
                  return;
                }
                let bf = "";
                mesg.on("data", (b: Buffer) => {
                  bf += b.toString("utf8");
                });
                mesg.on("error", () => {
                  console.log("向服务器请求错误");
                  resolve(false);
                });
                mesg.on("end", async () => {
                  let res: any = JSON.parse(bf);
                  //console.log("从搜索文件服务器返回的数据是：");
                  //console.log(res);
                  if (res.result == 'true') {
                      //console.log("获取的数据是：" + JSON.stringify(res.file));
                      //console.log("文件路径是：" + file_dir);
                      fs.writeFileSync(file_dir, res.file);
                      await shell.exec(`git add ${file_dir}`);
                      resolve(true);
                  } else { 
                    console.log(res.mes);
                    resolve(false);
                  }
                });
              }
            );
            fileRequest.on("error", () => {
              resolve(false);
            });
            fileRequest.write(
              JSON.stringify(param_post)
            );
            fileRequest.end();
          } 
      );
    }

    /**
     * 远程编译烧写
     * 
     */
    async remoteBurn(){
      //开始waiting
      this.waitingIndicator.register()
      let x = await this.upload();
      if (x == "error") {
        return false;
      }
      else if (x == "not_query") {
        return true
      }else{
        console.log("查询的地址是：" + x);
       let result = await this.queryCompileStatus(x);
        if(result == "scc"){
          // 停止waiting提示
           this.waitingIndicator.unRegister();
           this.outputResult("Command burning")
           // 又开始等待
           this.waitingIndicator.register()
           //烧写
           let result = await this.burn();
           //烧写成功
           this.waitingIndicator.unRegister()
           return result
        }else{
          return false;
        }
      }
        
      
      //console.log("文件上传的结果是：" + x);
      
    }
    
    /**
     * 上传文件到编译服务器
     * 1. 和初始下载的文件进行对比，生成.patch文件
     * 2. 将文件压缩，从config.json文件中获取编译相关的参数
     * 3. 将压缩后的文件和.patch文件一起打包发送到ldc进行编译
     */
    async upload(){
         // console.log("远程烧写文件");
        // console.log("当前根路径是：" + this._rootDir);
        //生成.patch文件
        // shell.cd(this._rootDir);
        // shell.exec("git diff>success.patch");
        //shell.exec("mkdir test");
        // console.log("生成success.patch文件完毕");
        //let patch_uri = path.join(this._rootDir, "success.patch");
        // console.log("是否存在success.patch文件？" + fs.existsSync(patch_uri))
        
         //获取patch文件内容
        //let patchData = fs.readFileSync(patch_uri);
        console.log("---compile:" + path)
        let ha = Ha.createHash("sha1");
        let tp =await this.archiveFile(this._rootDir);
       // return;
        let fileData = fs.readFileSync(tp);
        ha.update(fileData);
        //计算哈希值
        let fha = ha.digest("hex");
        this._filehash = fha;

        //从config.json中获取编译相关参数
        let config_path = path.join(this._rootDir, "config.json");
        console.log("config.json文件根目录是：" + config_path);
        //读取config.json文件中的内容，获取库信息和版本信息
        let config_json = fs.readFileSync(config_path);
        let config:any = JSON.parse(config_json.toString());
        let fm = new FormData();

        //组装传递的参数
        let parameters = {
          filehash: fha,
          boardType: config.serverType,
          compileType: config.projects[0].compileType,
          branch: config.branch
        };
        //'parameters={"filehash":"8bfc2a18e6b72e632c5068ea61d74680c349c66d", "boardType":"STM32F103C8", "compileType":"stm32-hal", "branch":"stm32-hal"};
        console.log("组装好后向后端传递的参数是：" + JSON.stringify(parameters));
        fm.append("parameters", JSON.stringify(parameters));
        fm.append("patch", fileData, "file.zip");
        
        console.log("请求头是：" + JSON.stringify(fm.getHeaders()));
     //   fs.removeSync(patch_uri);
        return await new Promise<string>((resolve) => {
          let fileRequest = http.request(
            {
              method: "POST",
              hostname: "kubernetes.tinylink.cn",
              ///
              path: "/linklab/compilev2/api/compilesystem",
              headers: fm.getHeaders(),
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
                  resolve("error");
                  return 
                }
                if (ob["msg"] == "error") {
                  this.outputResult(ob["data"]["message"],"error");
                  resolve("error");
                  return 
                }
                //说明之前已经编译完了，不需要再编译
                else if (ob["msg"] == "completed") {
                  console.log("-----entry-----")
                  this.outputResult("Compile scc");
                 
                    // b04f3ee8f5e43fa3b162981b50bb72fe1acabb33&boardtype=esp32devkitc&compiletype=alios
                    resolve("not_query")
                  return
                }
                let p;
              // /linklab/compilev2/api/compile/block\?filehash\="98bca5e26f43055315c81dc79cda22d29950f3d2"\&boardtype\="developerkit"\&compiletype\="alios"
                resolve( `/linklab/compilev2/api/compile/block/status?filehash=${fha}&boardtype=${parameters.boardType}&compiletype=${parameters.compileType}`);
                console.log(p);
              });
            }
          );
          fileRequest.on("error", () => {
            this.outputResult(
              "Network error!\nYou can check your network connection and retry.",
              "err"
            );
            resolve("error");
          });
          fm.pipe(fileRequest);
          fileRequest.end();
        } 
    );
    }

    
    /**
     * 查询编译过程中产生的日志信息
     * @param path 
     * @param output 
     * @param tag 
     * @returns 
     */
     async queryCompileStatus(path:string) {
      console.log("query compile status!")
      let p = new Promise<string>((resolve) => {
        console.log(p);
        
        let gf = http.request(
          {
            // protocol: "https:",
            method: "GET",
            host:  "kubernetes.tinylink.cn",
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
                resolve("scc");
              } else {
                this.outputResult(ob["data"]["message"], "err");
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
          resolve("error");
        });
        gf.end();
      });
      return await p;
    }

    //在文件编译的过程中其实编译器会保存编译好的文件，烧写其实就是给保存好的文件一个hash标识，烧写服务会根据hash标识定位文件来烧写
    /**
     * 烧写函数
     * @returns 
     */
  async burn(): Promise<boolean> {
    console.log("start burning")
    let burnElems: QueueBurnElem[] = [];
    // let projectData = this.projectData;
    // for (let i in projectData.subProjectArray) {
    //   //生成一个烧写对象
    //   let be = this.programBurnDataFactory.produceAdhocBurnElem();
    //   be.address = projectData.address[i];
    //   be.clientId = projectData.subClientId[i];
    //   be.devPort = projectData.subClientPort[i];
    //   be.runtime = projectData.subTimeouts[i];
    //   be.filehash = projectData.fileHash[i];
    //   projectData.subWaitingIds[i] = be.waitingId
    //   burnElems.push(be);
    // }
    let be = this.programBurnDataFactory.produceQueueBurnElem();
    let config = JSON.parse(this._config)
    //console.log("配置文件本身是" +config.projects[0].program.address);
    be.address = config.projects[0].program.address;
    be.runtime = config.projects[0].program.runtime;
    be.model =  config.projects[0].program.model;
    be.filehash = this._filehash;
    burnElems.push(be);
    
    // 一个skt对象里面包含多个be对象，skt代表的是一次实验的一组烧写对象
    let skt = this.programBurnDataFactory.produceAdhocSketon();
    skt.pid = "0000";//projectData.pid;
    skt.program = burnElems;
    //this.dService.refreshMultiData()
    return await this.lcc.burn(skt);
  }

  /**
   * 将一个文件夹中非空的代码复制到另外一个文件夹中
   * @param path 源文件夹目录
   */
  async fileCopy(source:string, desc:string){
      //console.log("源路径是：" + source + " 目的路径是：" + desc);
      let paths = fs.readdirSync(source);
      paths.forEach((path) => {
         let _src = Path.join(source, path);
         let _dst = Path.join(desc, path);
         var stat = fs.lstatSync(_src);
         if(stat.isFile()){
             if(path != "config.json" && stat.size > 0){
                  console.log("改变的文件是：" + _src);
                  if(!fs.existsSync(desc)){
                     fs.mkdirSync(desc, {recursive: true});
                  }
                  let readable = fs.readFileSync(_src);
                  fs.writeFileSync(_dst, readable);
             }
         }else{
             this.fileCopy(_src, _dst);
         }
      })
  }

  async archiveFile( path: string){//打包源代码
      let tmpPath = Path.join(this.generateTempFilePath());
      //console.log("临时文件夹是：" + tmpPath);
      fs.mkdirSync(tmpPath);
      this.fileCopy(path, tmpPath);
      let tp = Path.join(this.generateTempFilePath());
      // if(this.projectData.modifyOSCore){
      //   await this.diff.getZipFile(path,tp)
      // }else{
        console.log("------tp:" + tp)
        console.log("arcfile:" + tp);
        let ws = fs.createWriteStream(tp, { encoding: "binary" });
        let ps = new Promise<void>((res) => {
          ws.on("close", () => {
            res();
          });
        });
        let arc = Arc.create("zip");
        arc.directory(tmpPath , "/");
        arc.pipe(ws);
        await arc.finalize();
        await ps;  
      // }  
      return tp
  }
  
  generateTempFilePath(): string {
    if (OS.Type.Windows == OS.type()) {
      return path.join(
        "d://tmp",
        Math.random()
          .toString()
          .substring(3, 15)
      );
    } else {
      return path.join(
        "/tmp",
        Math.random()
          .toString()
          .substring(3, 15)
      );
    }
  }

    dispose(): void {
        // do nothing
    }
    setClient(client: BackendClient): void {
        this.client = client;
    }

    
}


