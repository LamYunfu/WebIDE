export interface CompilerInterFace{
    archiveFile(fileDir:string,out:string):Promise<string>
    config(data:any):Promise<string>
    upload(data:any):Promise<string>
    getFile(data:any,filePath:string):Promise<string>
}