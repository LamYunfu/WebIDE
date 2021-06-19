//file is deprecated
import { injectable } from "inversify";

@injectable()
export class Logger {

    
    static err(val: any,hintChar: string="!") {
        console.log( new Date().toLocaleString()+`!!ERR!!   ${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar} ${val}`)
    }


    static info(val: any,hintChar: string="-") {
        console.log(new Date().toLocaleString()+`##INFO##  ${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar} ${val}`)
    }


    static val(val: any,hintChar: string="*") {
        console.log(new Date().toLocaleString()+`%%VALUE%% ${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar} ${val}`)
    }
}