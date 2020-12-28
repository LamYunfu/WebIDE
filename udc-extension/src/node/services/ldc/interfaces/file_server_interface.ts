export interface FileServerInterface{
    uploadHex:(buffer: Buffer, boardname: string)=>Promise<string|undefined>
}
export const FileServerInterface = Symbol(
    "FileServerInterface"
  );