import { injectable } from "inversify";
import * as path from "path";
// export const DEPLOY_SERVER_IP = "47.114.130.247";
// export const DEPLOY_SERVER_DOMAIN = "test.tinylink.cn";
export const DEPLOY_SERVER_IP = "120.55.102.225";
export const DEPLOY_SERVER_DOMAIN = "tinylink.cn";
export const CONTIKI_IP = `${DEPLOY_SERVER_IP}`;
export const CONTIKI_PORT = "12382";
export const ALIOS_IP = `${DEPLOY_SERVER_IP}`;
export const ALIOS_PORT = "12305";
export const TINYLINK_HOST = `api.${DEPLOY_SERVER_DOMAIN}`;
export const PROGRAM_SERVER_IP = `${DEPLOY_SERVER_IP}`;
export const PROGRAM_SERVER_PORT = "8081";
export const SENCE_SERVER_URL = "ws://47.98.249.190:8004/";
export const LDC_SERVER_IP = `${DEPLOY_SERVER_IP}`;
export const LDC_SERVER_PORT = 5000;
export const TEMPLATE_SERVER = `judge.${DEPLOY_SERVER_DOMAIN}`;
// export const LINKLAB_WORKSPACE = `D:/all`;
export const CONFIGPATH = "D:/config";
export const RASPBERRY_QUERRY_IP = DEPLOY_SERVER_IP;
export const RASPBERRY_QUERRY_PORT = "12320";
// export const LINKLAB_WORKSPACE=`/home/project`
// export const CONFIGPATH="/home/config"
export const TINY_MOBILE_IP = `${DEPLOY_SERVER_DOMAIN}`;
export const TINY_MOBILE_PORT = `12320`;

// export const RASPBERRY_GCC_IP="121.199.78.80"
// export const RASPBERRY_GCC_PORT="10086"
export const RASPBERRY_GCC_IP = DEPLOY_SERVER_IP;
export const RASPBERRY_GCC_PORT = "12400";
@injectable()
export class RootDirPath {
  private rootDir: string = `D:/all`;
  get val(): string {
    return this.rootDir;
  }
  set val(val: string) {
    this.rootDir = path.join(this.rootDir, val);
  }
  reset() {
    this.rootDir = `D:/all`;
  }
}
