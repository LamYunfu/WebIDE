import { interfaces } from 'inversify';
import { ProblemController } from './../../problem_controller/problem_controller';
import { inject, injectable } from 'inversify';
import { Logger } from "../../util/logger";
export function bindDisplayBoardBackEnd(bind:interfaces.Bind){
    bind(DisplayBoardBackEnd).toSelf().inSingletonScope();
}
@injectable()
export class DisplayBoardBackEnd{
constructor(@inject(ProblemController) readonly pc :ProblemController){

}
   async  init(infoRaw :string){
        try {
            let info = JSON.parse(infoRaw);
            let project = info.project;
            info = info.info;
            let x: { [key: string]: any } = {};
            x[info.pid] = {
              dirName: info.title,
              ppid: info.pid,
              loginType: "queue",
              model: "#####",
              type: "displayboard",
            };
            Logger.info("init Display");
            this.pc.init(JSON.stringify(x));
          } catch (e) {
            console.log(e);
          }
    }
    burn(){

    }
    getLog(){

    }
}