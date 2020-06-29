import { ModelTrainer } from './model_trainer';
import { interfaces } from 'inversify';
export function bindModelTrainer(bind: interfaces.Bind) {
    bind(ModelTrainer).toSelf().inSingletonScope()
}