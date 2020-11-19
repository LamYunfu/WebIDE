import * as path from "path"
import * as fs from "fs"
export namespace showWord{
    //字符串解析器
    export class WordldParser{
        bytesOfASC : Buffer;   //英文字符的ASCII码
        bytesOfHanzi: Buffer;  //汉字的ASCII码
        pathOfASC : string = path.join(__dirname , "zk" , "ASC16");  //ASCII编码文件路径
        pathOfHanzi : string = path.join(__dirname , "zk" , "HZK16");  //汉字编码文件路径

        constructor(){
            this.bytesOfASC = fs.readFileSync(this.pathOfASC) ;
            this.bytesOfHanzi = fs.readFileSync(this.pathOfHanzi);
        }

        // <summary>
        // 获取指定的字符的点阵
        // </summary>
        // <param name="c">字符</param>
        // <param name="lines">点阵行数</param>
        // <param name="columns">点阵列数</param>
        // <returns>点阵数据,对应值为true表示该点应该被显示,否则对应点不应该被显示</returns>
        public getWordLattics(c : string):number[][]{
            let lines:number = 16;
            let columns:number = 8;
            let lattics:number[][] = new Array(lines);
            for(let i = 0;i < lines;i++){
                lattics[i] = new Array(columns);
            }
            let intValue:number = c.charCodeAt(0);     //获取字符的ASCII码值
            //console.log(intValue);
            let offset = 0;

            if(intValue <= 255){
                offset = intValue * 16;
                for(let i = 0;i < lines;i++){
                    for(let j = 0;j < columns;j++){
                        let byteValue = this.bytesOfASC[offset + i];
                        //console.log(((byteValue >> (7-j)) & 0x1) == 0);
                        lattics[i][j] = ((byteValue >> (7-j)) & 0x1); //读取byte八位后向右边移动7-j位
                    }
                }

            }
            return lattics;
        }     
    }
}