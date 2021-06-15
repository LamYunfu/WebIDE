import { injectable} from "inversify";
import { BackendClient, OSdevBackendService} from "../common/protocol";
import * as path from "path";
import * as fs from "fs-extra";
import * as shell from "shelljs";
//import * as child_process from "child_process";
import * as http from "http";
import {ROOTPATH} from "udc-extension/lib/setting/backend-config";
import * as FormData from "form-data";
import * as Arc from "archiver";
import * as Path from "path";
import * as Ha from "crypto";
import { OS } from "@theia/core";
//import URI from "@theia/core/lib/common/uri";

//import URI from "@theia/core/lib/common/uri";

@injectable()
export class OSdevBackendServiceImpl implements OSdevBackendService {
    testReturnWord(): string { 
      console.log("不是已经调用了吗？怎么会显示不出来呢？");
      this.downLoadSingleFile("test1", "test2");
      return "测试方法调用成果";
    }
   
    client : BackendClient;
    protected _rootDir:string = "";
    protected os_name:string = "";
    protected os_version:string = "";

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
        fs.existsSync(uri) ? "" : fs.mkdirSync(uri);
        //新建配置文件config.json
        this._rootDir = uri.toString();
        let configJsonUri = path.join(uri, "config.json");
        //将配置json内容jsonFile,存储起来，放在新建文件config.json内
        if(fs.existsSync(configJsonUri)){
            fs.removeSync(configJsonUri);
        }
        //以美化的方式写入json配置文件
        fs.writeFileSync(configJsonUri, JSON.stringify(config, null, "\t"));
        //从模板服务器下载文件目录
        await this.downLoadFileStructure(uri, config.osType, config.branch);
        //打开调用前端方法文件夹工作空间，在右边显示
        uri.replace(/\\/g,"\/");
        this.client.openWorkSpace(uri);
        //打开文件视图
        this.client.openExplore();
        //初始化项目
        shell.cd(this._rootDir);
        await shell.exec("git init");
        await shell.exec("git add .");
        await shell.exec(`git commit -m "start project"`);
        
        return true;
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
                    console.log("从模板服务器返回的数据是：");
                    console.log(res);
                    if (res.result == 'true') {
                        //console.log("获取的数据是：" + JSON.stringify(res.template));
                        await this.createFileStructure(res.template, rootDir);
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
     * 远程烧写
     */
    async remoteBurn(){
        // console.log("远程烧写文件");
        // console.log("当前根路径是：" + this._rootDir);
        //生成.patch文件
        shell.cd(this._rootDir);
        shell.exec("git diff>success.patch");
        //shell.exec("mkdir test");
        // console.log("生成success.patch文件完毕");
        //let patch_uri = path.join(this._rootDir, "success.patch");
        // console.log("是否存在success.patch文件？" + fs.existsSync(patch_uri))
        
        console.log("---compile:" + path)
        let ha = Ha.createHash("sha1");
        let tp =await this.archiveFile(this._rootDir);
        let fileData = fs.readFileSync(tp);
        ha.update(fileData);
        let fha = ha.digest("hex");
        //计算哈希值
        // let fhas = this.projectData.fileHash;
        // fhas[parseInt(projectIndex)] = fha;
        // this.projectData.fileHash = fhas;
    
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
          boradType: config.serverType,
          compileType: config.branch,
          branch: config.branch
        };
        console.log(JSON.stringify(parameters));
        fm.append("parameters", JSON.stringify(parameters));
        fm.append("file", fileData, "file.zip");

        return await new Promise<boolean>((resolve) => {
          let fileRequest = http.request(
            {
              method: "POST",
              hostname: "kubernetes.tinylink.cn",
              ///
              path: "/linklab/compilev2/api/compilesystem",
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
                console.log("编译服务器返回的数据是：");
                //console.log(res);
                if (res.code != '-1') {
                    console.log("获取的数据是：" + JSON.stringify(res.data));
                    //console.log("文件路径是：" + file_dir);
                    //fs.writeFileSync(file_dir, res.file);
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
         
          fileRequest.end();
        } 
    );
        
    }

    async archiveFile( path: string){//打包源代码
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
        arc.directory(path, "/");
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


