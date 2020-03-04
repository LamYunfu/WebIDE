import { inject, injectable, named } from 'inversify';
import { ContributionProvider } from '@theia/core/lib/common/contribution-provider';
import { TreeDecorator, AbstractTreeDecoratorService } from '@theia/core/lib/browser/tree/tree-decorator';


export const DrawboardTreeDecorator = Symbol('DrawboardTreeDecorator');
@injectable()
export class DrawboardDecoratorService extends AbstractTreeDecoratorService {

    constructor(@inject(ContributionProvider) @named(DrawboardTreeDecorator) protected readonly contributions: ContributionProvider<TreeDecorator>) {
        super(contributions.getContributions());
    }

}
