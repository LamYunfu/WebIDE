import * as EventEmitor from 'events'
import { Logger } from "./logger"


export class HalfPackProcess extends EventEmitor {
    constructor() {
        super()
        this.dataBuffer = new Buffer(this.maxSize)
        this.cursorStart = 0
        this.cursorEnd = 0
        this.currentDataSize = 0
    }
    maxSize: number = 2048
    dataBuffer: Buffer
    cursorStart: number
    cursorEnd: number
    currentDataSize: number
    callNum: number = 1

    
    puttingData(inData: Buffer): void {
        if (this.currentDataSize + inData.length > this.maxSize) {
            Logger.info("data overflowing")
            return
        }
        for (let index = 0; index < inData.length; index++) {
            this.dataBuffer[(this.cursorEnd + index) % this.maxSize] = inData[index]
        }
        this.cursorEnd = (this.cursorEnd + inData.length) % this.maxSize
        this.currentDataSize = this.cursorEnd - this.cursorStart < 0 ?
            this.maxSize + this.cursorEnd - this.cursorStart : this.cursorEnd - this.cursorStart
        this.acquireData()
    }

    
    acquireData() {
        Logger.info(`before start:${this.cursorStart}size:${this.currentDataSize}end:${this.cursorEnd}`)
        if (this.currentDataSize < 0) {
            Logger.info("!!!!!!!!!something goes wrong exit1 size:" + this.currentDataSize)
        }
        if (this.currentDataSize < 12) {
            Logger.info("exit1 size:" + this.currentDataSize)
            return
        }
        let ctlen =
            (this.cursorStart + 6) % this.maxSize <= (this.cursorStart + 11) % this.maxSize ?
                parseInt(this.dataBuffer.subarray((this.cursorStart + 6) % this.maxSize, (this.cursorStart + 11) % this.maxSize).toString("ascii"))
                : parseInt(this.dataBuffer.subarray(this.cursorStart + 6, this.maxSize).toString("ascii") + this.dataBuffer.subarray(0, 11 + this.cursorStart - this.maxSize).toString("ascii"))
        Logger.info(`ctlen:${ctlen}:size${this.currentDataSize}`)
        if (ctlen + 13 > this.currentDataSize) {
            Logger.info(`exit2:${ctlen}:${this.currentDataSize}`)
            return
        }
        let tmp
        if (isNaN(ctlen)) {
            Logger.info("!!!!!!!!!!!ctlen is NAN,recovery:" + `exit2:${ctlen}:${this.currentDataSize}`)
            this.cursorStart = 0
            this.cursorEnd = 0
            this.currentDataSize = 0
            return
        }
        if (this.cursorStart + ctlen + 13 <= this.maxSize) {
            tmp = this.dataBuffer.subarray(this.cursorStart, this.cursorStart + ctlen + 13)

        }
        else {
            tmp = Buffer.concat([this.dataBuffer.subarray(this.cursorStart, this.dataBuffer.length),
            this.dataBuffer.subarray(0, (this.cursorStart + ctlen + 13) % this.maxSize)])
        }
        this.emit("data", tmp)
        this.currentDataSize -= tmp.length
        this.cursorStart = (this.cursorStart + tmp.length) % this.maxSize
        Logger.info(`after start:${this.cursorStart}size:${this.currentDataSize}end:${this.cursorEnd}`)
        this.acquireData()
    }
}
// let hpp = new HalfPackProcess()
// hpp.on("data", (data) => {
//     Logger.info("fire" + data.toString("ascii"))
// })
// for (let x = 3; x > 0; x--) {
//     hpp.puttingData(new Buffer(`{ADEV,00065,:5bbf5bdc36245c88,`))
//     hpp.puttingData(new Buffer(`/dev/tinylink_platform_1-95736323632351D0E120|0}`))
// }