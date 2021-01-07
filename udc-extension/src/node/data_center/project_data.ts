import { injectable } from "inversify";
export type LoginType = "adhoc" | "queue" | string;
@injectable()
export class ProjectData {
  protected _projectRootDir: string = `串口打印(AliOS)`;
  protected _pid: string = "26";
  protected _loginType: LoginType = "queue";
  protected _serverType: string = "alios_esp32";
  protected _subProjectArray: string[] = ["device"];
  protected _subModelTypes: string[] = ["alios_esp32"];
  protected _subBoardTypes: string[] = ["esp32devkitc"];
  protected _subCompileTypes: string[] = ["alios"];
  protected _address: string[] = ["0x1000"];
  protected _fileHash: string[] = [];
  protected _subTimeouts: number[] = [30];
  protected _subClientId: string[] = [];
  protected _subClientPort: string[] = [];
  protected _subWaitingIds: string[] = [];
  protected _subHexFileDirs: string[] = ["hexFiles"];
  protected _ppid: string = "";
  protected _experimentType: string | undefined = undefined
  protected _modifyOSCore:boolean=false
  protected _experimentName:string=""
  get modifyOSCore(){
    return this._modifyOSCore
  }
  set modifyOSCore(val :boolean){
    this._modifyOSCore=val
  }
  get experimentName(){
    return this._experimentName
  }
  set experimentName(val :string){
    this._experimentName=val
  }
  get loginType() {
    return this._loginType;
  }

  set loginType(loginType: LoginType) {
    this._loginType = loginType;
  }
  get pid() {
    return this._pid;
  }

  set pid(pid: string) {
    this._pid = pid;
  }
  get experimentType() {
    return this._experimentType;
  }

  set experimentType(experimentType: string | undefined) {
    this._experimentType = experimentType;
  }
  get ppid() {
    return this._ppid;
  }

  set ppid(ppid: string) {
    this._ppid = ppid;
  }
  get serverType() {
    return this._serverType;
  }

  set serverType(serverType: string) {
    this._serverType = serverType;
  }
  get projectRootDir() {
    return this._projectRootDir;
  }

  set projectRootDir(projectRootDir: string) {
    this._projectRootDir = projectRootDir;
  }
  get subProjectArray(): string[] {
    return this._subProjectArray;
  }
  set subProjectArray(subProjectArray: string[]) {
    this._subProjectArray = subProjectArray;
  }
  get address(): string[] {
    return this._address;
  }
  set address(address: string[]) {
    this._address = address;
  }
  get subCompileTypes(): string[] {
    return this._subCompileTypes;
  }
  set subCompileTypes(subCompileTypes: string[]) {
    this._subCompileTypes = subCompileTypes;
  }
  get subModelTypes(): string[] {
    return this._subModelTypes;
  }
  set subModelTypes(subModelTypes: string[]) {
    this._subModelTypes = subModelTypes;
  }
  get subTimeouts(): number[] {
    return this._subTimeouts;
  }
  set subTimeouts(subTimeouts: number[]) {
    this._subTimeouts = subTimeouts;
  }
  get subWaitingIds(): string[] {
    return this._subWaitingIds;
  }
  set subWaitingIds(subWaitingIds: string[]) {
    this._subWaitingIds = subWaitingIds;
  }
  get subHexFileDirs(): string[] {
    return this._subHexFileDirs;
  }
  set subHexFileDirs(subHexFileDirs: string[]) {
    this._subHexFileDirs = subHexFileDirs;
  }
  get subBoardTypes(): string[] {
    return this._subBoardTypes;
  }
  set subBoardTypes(subBoardTypes: string[]) {
    this._subBoardTypes = subBoardTypes;
  }
  get fileHash(): string[] {
    return this._fileHash;
  }
  set fileHash(fileHash: string[]) {
    this._fileHash = fileHash;
  }
  get subClientId(): string[] {
    return this._subClientId;
  }
  set subClientId(subClientId: string[]) {
    this._subClientId = subClientId;
  }
  get subClientPort(): string[] {
    return this._subClientPort;
  }
  set subClientPort(subClientPort: string[]) {
    this._subClientPort = subClientPort;
  }
}
