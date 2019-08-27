export const udcServicePath = "/services/udcserver";
export const UdcService = Symbol('UdcService');
export enum LOGINTYPE { ADHOC = 'adhoc', FIXED = 'fixed', GROUP = 'group', QUEUE = 'queue' }


export interface UdcService {
    is_connected(): Promise<Boolean>;
    connect(type: string, model: string, pid: string, timeout: string): Promise<string>;
    disconnect(): Promise<string>;
    list_models(): Promise<Array<string>>;
    get_devices(): Promise<{ [key: string]: number } | undefined>;
    program(uri: string, address: string, devstr: string, pid: string): Promise<Boolean>;
    rumcmd(devstr: string, cmdstr: string): Promise<Boolean>;
    control(devstr: string, operation: string): Promise<Boolean>;
    postSrcFile(pid: string): void
    setCookie(cookie: string): boolean
    outputResult(res: string): void
    storeState(stat: string): void
    getState(type: string): Promise<string>
    setQueue(): void
    setPidInfos(pid: string, content: { loginType: string, timeout: string, model: string, waitID: string, fns?: string, dirName?: string }): void
    initPidQueueInfo(infos: string): Promise<string>
    setTinyLink(name: string, passwd: string): void
    config(): void

}



