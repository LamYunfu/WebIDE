import { injectable } from "inversify";
import * as path from "path";
import * as fs from "fs-extra";
// import { getCompilerType } from '../globalconst';
import * as crypto from "crypto";
import * as ach from "archiver";
import { OS } from "@theia/core";
import * as adm from "adm-zip";
@injectable()
export class FileCompressor {
  async compress(srcPath: string, targetPath: string): Promise<boolean> {
    try {
      let st = fs.createWriteStream(targetPath); //打包
      let achst = ach.create("zip").directory(srcPath, false);
      let p = new Promise<boolean>((resolve) => {
        st.on("close", () => {
          console.log("Packing files successful!");
          resolve(true);
        });
      });
      achst.pipe(st);
      achst.finalize();
      return await p;
    } catch (error) {
      return false;
    }
  }
  async unfold(srcPath: string, entryName: string, targetPath: string) {
    let x = new adm(srcPath);
    console.log(x.getEntries().toString());
    return x.extractEntryTo(x.getEntry(entryName), targetPath, false, true);
  }
  async unfoldAll(srcPath: string, targetPath: string) {
    let x = new adm(srcPath);
    await x.extractAllTo(targetPath, true);
  }
  async getHash(rb: string | Buffer, type: string = "sha1"): Promise<string> {
    let hash = crypto.createHash(type);
    return await hash.update(rb).digest("hex");
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
}
