import { injectable, } from 'inversify';
import * as path from 'path'
import * as fs from 'fs-extra';
import { Logger } from './logger'
@injectable()
/*
文件操作
*/
export class Controller {
    constructor() {
    }
    rootDir: string = "/home/project"
    creatSrcFile(fnJSON: string, dirName: string) {
        let fn = JSON.parse(fnJSON)
        let rootdir = this.rootDir
        fs.exists(path.join(rootdir, dirName), (res) => {
            if (!res) {
                fs.mkdir(path.join(rootdir, dirName), (err) => {
                    Logger.info(err)
                    for (let i of fn) {
                        let x: string[] = i.split(".")
                        let tmpPath = ""
                        if (x.length == 1)
                            tmpPath = path.join(rootdir, dirName, i + ".cpp")
                        else
                            tmpPath = path.join(rootdir, dirName, i)
                        fs.exists(tmpPath, (res) => {
                            if (!res)
                                fs.writeFile(tmpPath, '', {}, (err) => { if (err != null) console.log(err) })
                        })
                    }
                })
            }
            else
                for (let i of fn) {
                    let x: string[] = i.split(".")
                    let tmpPath = ""
                    if (x.length == 1)
                        tmpPath = path.join(rootdir, dirName, i + ".cpp")
                    else
                        tmpPath = path.join(rootdir, dirName, i)
                    fs.exists(tmpPath, (res) => {
                        if (!res)
                            fs.writeFile(tmpPath, '', {}, (err) => { if (err != null) console.log(err) })
                    })
                }
        })
    }
}