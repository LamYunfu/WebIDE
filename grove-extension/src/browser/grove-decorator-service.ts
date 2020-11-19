import { inject, injectable, named } from 'inversify';
import { ContributionProvider } from '@theia/core/lib/common/contribution-provider';
import { TreeDecorator, AbstractTreeDecoratorService } from '@theia/core/lib/browser/tree/tree-decorator';


export const GroveTreeDecorator = Symbol('GroveTreeDecorator');
@injectable()
export class GroveDecoratorService extends AbstractTreeDecoratorService {

    constructor(@inject(ContributionProvider) @named(GroveTreeDecorator) protected readonly contributions: ContributionProvider<TreeDecorator>) {
        super(contributions.getContributions());
    }

}
