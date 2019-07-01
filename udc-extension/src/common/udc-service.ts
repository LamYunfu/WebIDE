export const udcServicePath = "/services/udcserver";
export const UdcService = Symbol('UdcService');

export enum LOGINTYPE { ADHOC = 'adhoc', FIXED = 'fixed' }

export interface UdcService {

    is_connected(): Promise<Boolean>;
    connect(type: LOGINTYPE, model: string): Promise<string>;
    disconnect(): Promise<string>;
    list_models(): Promise<Array<string>>;
    get_devices(): Promise<{ [key: string]: number } | undefined>;
    program(uri: string, address: string, devstr: string): Promise<Boolean>;
    judge(filepath: string, address: string, devstr: string, token: string): Promise<Boolean>
    get_quiz_token(quizNo: string): boolean 
    get_quiz_status(quiztoken: string):void  
    getToken():string
    rumcmd(devstr: string, cmdstr: string): Promise<Boolean>;
    control(devstr: string, operation: string): Promise<Boolean>;
    get_issues():Promise<string>
    quizJudge(host: string, port: string, pid: string):Promise<string>
    setJudgeHostandPort(judgeHost: string, judgePort: string):void
    setLdcHostandPort(ldcHost: string, ldcPort: string) :void   
    queryStatus(issueNumList: string) :Promise<{[key:string]:string}>
    createSrcFile(fn: string) :void
    // createSrcFile(fn: string[]) :void
    postSrcFile(fn:string):void

}



