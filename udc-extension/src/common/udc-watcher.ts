import { injectable } from "inversify";
import { Emitter, Event } from "@theia/core/lib/common/event";


export const UdcClient = Symbol("UdcClient");


export interface UdcClient {
    OnDeviceLog(data: string): void,
    onDeviceList(data: { [key: string]: number }): void
    onConfigLog(data: { name: string, passwd: string }): void
}
@injectable()
export class UdcWatcher {
    protected onDeviceLogEmitter = new Emitter<string>();
    protected onDeviceListEmitter = new Emitter<{ [key: string]: number }>();
    protected onConfigEmitter = new Emitter<{ name: string, passwd: string }>(); 
    getUdcWatcherClient(): UdcClient {
        const logEmitter = this.onDeviceLogEmitter;
        const devsEmitter = this.onDeviceListEmitter;
        const configEmitter = this.onConfigEmitter;
        return {
            OnDeviceLog(data: string) {
                logEmitter.fire(data)
            },
            onDeviceList(data: { [key: string]: number }) {
                devsEmitter.fire(data)
            }
            ,
            onConfigLog(data: { name: string, passwd: string }) {
                configEmitter.fire(data)
            }
        }
    }
    get onConfigLog(): Event<{ name: string, passwd: string }> {
        return this.onConfigEmitter.event;
    }
    get onDeviceLog(): Event<string> {
        return this.onDeviceLogEmitter.event;
    }

    get onDeviceList(): Event<{ [key: string]: number }> {
        return this.onDeviceListEmitter.event
    }
}