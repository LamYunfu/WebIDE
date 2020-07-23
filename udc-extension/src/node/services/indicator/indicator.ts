import { interfaces } from 'inversify';
import { LdcShellInterface } from './../ldc_shell/interfaces/ldc_shell_interface';
import { inject, injectable } from 'inversify';
export function bindIndicator(bind:interfaces.Bind){
        bind(Indicator).toSelf().inSingletonScope()
}
@injectable()
export class  Indicator{
    handler:any
    constructor(
        @inject(LdcShellInterface) protected ldcShell:LdcShellInterface
    ){

    }  
    register(slogan:string="Waiting..."){
        if(!this.handler){      
            let n=0; 
            this.handler=setInterval(()=>{
                    n++;
                    if(n==20){
                        this.unRegister();
                    }
                    else{
                        this.ldcShell.outputResult(slogan,"sys");
                    }
                  
            },2000)                
        }
    }
    unRegister(){
        if(!!this.handler)
            clearInterval(this.handler);
        this.handler=null;
    }
    
}