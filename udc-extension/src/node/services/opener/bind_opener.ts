import { FileOpener } from './file_openner';

import { interfaces } from 'inversify';
export function bindOpener(bind: interfaces.Bind) {
    bind(FileOpener).toSelf().inSingletonScope()

}