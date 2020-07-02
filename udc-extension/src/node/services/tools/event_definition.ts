import { injectable } from "inversify";

@injectable()
export class EventDefinition {
    readonly programState: string = "programState"
}