export interface LdcInterface{
    connect:(deviceType:string,userID:string,loginType:string,pid:string,timeout:string)=>Promise<boolean>
    disconnect:()=>Promise<boolean>
}