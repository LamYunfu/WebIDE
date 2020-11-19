import { injectable } from "inversify";
import * as path from "path";
// export const DEPLOY_SERVER_IP = "10.200.20.5";
// export const DEPLOY_SERVER_DOMAIN = "test.tinylink.cn"; 
export const DEPLOY_SERVER_IP = "120.55.102.225";
export const DEPLOY_SERVER_DOMAIN = "tinylink.cn";
export const FILE_SERVER_HOST = `fileserver.${DEPLOY_SERVER_DOMAIN}`
export const CONTIKI_IP = `${DEPLOY_SERVER_IP}`;
export const CONTIKI_PORT = "12382";
export const ALIOS_IP = `${DEPLOY_SERVER_IP}`;
export const ALIOS_PORT = "12305";
export const TINYLINK_HOST = `api.${DEPLOY_SERVER_DOMAIN}`;
export const PROGRAM_SERVER_IP = `${DEPLOY_SERVER_IP}`;
export const PROGRAM_SERVER_PORT = "8081";
export const SENCE_SERVER_URL = "ws://47.98.249.190:8004/";
export const LDC_SERVER_IP = `${DEPLOY_SERVER_IP}`;
export const LDC_SERVER_PORT = 5000;                            //正式版ldc端口
//export const LDC_SERVER_PORT = 65003;                         //测试版ldc端口
export const TEMPLATE_SERVER = `judge.${DEPLOY_SERVER_DOMAIN}`;
export const RASPBERRY_QUERRY_IP = DEPLOY_SERVER_IP;
export const RASPBERRY_QUERRY_PORT = "12320";
export const TINY_MOBILE_IP = `${DEPLOY_SERVER_DOMAIN}`;
// export const TINY_MOBILE_IP = `47.96.155.111`;
export const TINY_MOBILE_PORT = `12355`;
export const TINYLINEDGECOMPILE_IP = `47.96.155.111`;
// export const RASPBERRY_GCC_IP="121.199.78.80"
// export const RASPBERRY_GCC_PORT="10086"
export const RASPBERRY_GCC_IP = DEPLOY_SERVER_IP;
export const RASPBERRY_GCC_PORT = "12400";
export const DISTRIBUTEDCOMPILER_IP = "kubernetes.tinylink.cn";

//本地使用的路径
// export const CONFIGPATH = "D:/config";
// export const Call_Log_Path = "D:/call_info.log";
// export const ROOTPATH="D:/all"

//服务器上使用的路径
export const ROOTPATH="/home/project"
export const Call_Log_Path="/home/project/call_info.log"
export const CONFIGPATH="/home/config"

@injectable()
export class RootDirPath {
  private rootDir: string = `/home/project`;
  get val(): string {
    return this.rootDir;
  }
  set val(val: string) {
    this.rootDir = path.join(this.rootDir, val);
  }
  reset() {
    this.rootDir = `/home/project`;
  }
}

