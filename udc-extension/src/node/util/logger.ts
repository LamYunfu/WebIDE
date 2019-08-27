import { injectable } from "inversify";

@injectable()
export class Logger {

    
    static err(val: any,hintChar: string="!") {
        console.log(`!!ERR!!   ${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar} ${val}`)
    }


    static info(val: any,hintChar: string="-") {
        console.log(`##INFO##  ${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar} ${val}`)
    }


    static val(val: any,hintChar: string="*") {
        console.log(`%%VALUE%% ${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar}${hintChar} ${val}`)
    }
}