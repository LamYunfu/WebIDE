import { injectable } from "inversify";

@injectable()
export class FileMapper {
    private fileNameStorage: { [pid: string]: { [rawName: string]: string } } = {}
    private fileDeviceStorage: { [pid: string]: { [fileName: string]: string } } = {}
    getFileNameMapper(pid: string, rawName?: string) {
        if (rawName == undefined)
            return this.fileNameStorage[pid]
        else
            return this.fileNameStorage[pid][rawName]
    }
    setFileNameMapper(pid: string, pair: { [rawName: string]: string }) {
        if (this.fileNameStorage[pid] == undefined) {
            this.fileNameStorage[pid] = {}
        }
        this.fileNameStorage[pid] = {
            ...this.fileNameStorage[pid],
            ...pair
        }
    }
    getFileDeviceMapper(pid: string, fileName?: string) {
        if (fileName == undefined)
            return this.fileDeviceStorage[pid]
        else
            return this.fileDeviceStorage[pid][fileName]
    }
    setFileDeviceMapper(pid: string, pair: { [fileName: string]: string }) {
        if (this.fileDeviceStorage[pid] == undefined) {
            this.fileDeviceStorage[pid] = {}
        }
        this.fileDeviceStorage[pid] = {
            ...this.fileDeviceStorage[pid],
            ...pair
        }
    }

}