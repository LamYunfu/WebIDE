import { interfaces } from 'inversify';
import { UserInfo } from '../../data_center/user_info';
import { injectable, inject } from 'inversify';
import { LdcShellInterface } from '../ldc_shell/interfaces/ldc_shell_interface';
export function bindLocalBurn(bind: interfaces.Bind) {
    bind(LocalBurnerNotifier).toSelf().inSingletonScope()
}
@injectable()
export class LocalBurnerNotifier{
    constructor(
        @inject(UserInfo) readonly  user_info:UserInfo,
        @inject(LdcShellInterface) protected ldcShell: LdcShellInterface,
    ){
    }
    notify(url:string){        
        
        this.ldcShell.executeFrontCmd({name:"local_burn",passwd:url})    
    }
}
