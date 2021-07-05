import { injectable, interfaces } from "inversify";
export function  bindCompilerTag(bind:interfaces.Bind){
    bind(CompilerTag).toSelf().inSingletonScope()
}
@injectable()
export  class CompilerTag{
    private _isCompileAndSaveBinary: boolean = false;
    public get isCompileAndSaveBinary(): boolean {
        return this._isCompileAndSaveBinary;
    }
    public set isCompileAndSaveBinary(value: boolean) {
        this._isCompileAndSaveBinary = value;
    }
}