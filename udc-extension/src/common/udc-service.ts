export const udcServicePath = "/services/udcserver";
export const UdcService = Symbol('UdcService');
export enum LOGINTYPE { ADHOC = 'adhoc', FIXED = 'fixed', GROUP = 'group' }


export interface UdcService {
    is_connected(): Promise<Boolean>;
    connect(type: string, model: string, pid: string): Promise<string>;
    disconnect(): Promise<string>;
    list_models(): Promise<Array<string>>;
    get_devices(): Promise<{ [key: string]: number } | undefined>;
    program(uri: string, address: string, devstr: string): Promise<Boolean>;
    rumcmd(devstr: string, cmdstr: string): Promise<Boolean>;
    control(devstr: string, operation: string): Promise<Boolean>;
    createSrcFile(fn: string): void
    postSrcFile(fn: string): void
    setCookie(cookie: string): boolean
    outputResult(res: string): void
    storeState(stat: string): void
    getState():Promise<string>

}



