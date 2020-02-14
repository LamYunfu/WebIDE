export const udcServicePath = "/services/udcserver";
export const UdcService = Symbol('UdcService');
export enum LOGINTYPE { ADHOC = 'adhoc', FIXED = 'fixed', GROUP = 'group', QUEUE = 'queue' }


export interface UdcService {
    is_connected(): Promise<Boolean>;
    connect(type: string, model: string, pid: string, timeout: string): Promise<boolean>;
    disconnect(): Promise<string>;
    list_models(): Promise<Array<string>>;
    get_devices(): Promise<{ [key: string]: number } | undefined>;
    program(uri: string, address: string, devstr: string, pid: string): Promise<Boolean>;
    rumcmd(devstr: string, cmdstr: string): Promise<Boolean>;
    control(devstr: string, operation: string): Promise<Boolean>;
    postSrcFile(pid: string): void
    setCookie(cookie: string): boolean
    outputResult(res: string, types?: string): void
    storeState(stat: string): void
    getState(type: string): Promise<string>
    setQueue(): void
    setPidInfos(pid: string, content: { loginType: string, timeout: string, model: string, waitID: string, fns?: string, dirName?: string, deviceRole?: string[] | undefined }): void
    initPidQueueInfo(infos: string): Promise<string>
    setTinyLink(name: string, passwd: string): void
    config(): void
    programSingleFile: (pidAndFn: string) => void
    postSimFile: (pid: string) => void
    openPidFile: (pid: string) => void
    continueExe: () => void
    terminateExe: () => void
    postFreeCodingFile: (pid: string) => void
    literalAnalysis: (pid: string) => void
    train: (pid: string) => void
    virtualSubmit: (pid: string) => void
    openFile: (pid: string, filename: string) => void
    linkEdgeConnect: (pid: string, threeTuple: any) => Promise<boolean>
    developLinkEdgeProject: (pid: string, indexStr: string) => Promise<boolean>
    addLinkEdgeProject: (pid: string, deviceInfo: any) => Promise<boolean>
    getLinkEdgeDevicesInfo: (pid: string) => Promise<any>
    remove: (pid:string,index: string) => Promise<boolean>
    createOnelinkProject:(projetName:string,pid:string)=>Promise<boolean>
    openDevice:()=>void
    openMobile:()=>void
    compileMobile:()=>Promise<boolean>
    compileDevice:()=>Promise<boolean>
}



