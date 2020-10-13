import {showWord} from "./toDot"
export class GrooveToDot{
    public worldPaser: showWord.WordldParser;
    constructor(){
        this.worldPaser = new showWord.WordldParser();
    }

    //sentence : 传入的一行文字
    //charNum: 一行显示文字的个数
    //返回： 这行文字的点阵码
    getOneLineDot(sentence: string, charNum: number):number[][]{
        let lines:number = 16;
        let column:number = 8;    //一个字符占8列
        let columns:number = column * charNum;  //一个字符占8列，一行显示16个字符。
        let latticsLine:number[][] = new Array(lines);
        for(let i = 0;i < lines;i++){
            latticsLine[i] = new Array(columns);
        }
        for(let i = 0;i < sentence.length;i++){
            let character:string = sentence.charAt(i);  //获取一个字符
            let lattics = this.worldPaser.getWordLattics(character);  //获取这个字符的点阵码
            //将这个字符的点阵码写到一行的点阵码里面
            for(let j = 0;j < lines;j++){
                for(let k = 0;k < column;k++){
                    let k_line = k + i * 8;
                    latticsLine[j][k_line] = lattics[j][k];
                }
            }
        }
        return latticsLine;
    }

    //sentence: 需要在groove lcd屏幕上显示的文字
    //返回： grooveLcd上的文字阵列 32 * 128
    getGrooveDot(sentence:string):number[][]{
        let lines:number = 32;
        let charPerLie = 16;
        let columns:number = 128;
        let latticsGroove:number[][] = new Array(lines);
        //初始化数组
        for(let i = 0;i < lines;i++){
            latticsGroove[i] = new Array(columns);
            // for(let j = 0;j < columns;j++){
            //     latticsGroove[i][j] = 0;
            // }
        }
        //groove lcd显示屏幕最多显示16*2 = 32个字符。
        let firstLine = sentence.substr(0, 16);    //截取第一行字符
        let secondLine = sentence.substr(16, 16);   //截取第二行字符
        //console.log(secondLine);
        let firstLattics:number[][] = this.getOneLineDot(firstLine, charPerLie);
        let senondLattics:number[][] = this.getOneLineDot(secondLine, charPerLie);
        for(let i = 0;i < 16;i++){
            for(let j = 0;j < 128;j++){
                latticsGroove[i][j] = firstLattics[i][j] == undefined ? 0 : firstLattics[i][j];
                latticsGroove[i+16][j] = senondLattics[i][j] == undefined ? 0 : senondLattics[i][j];
            }
        }
        return latticsGroove;
    }
}