import { injectable } from "inversify";
import { JsonObject, JsonProperty } from "json2typescript";
@injectable()
@JsonObject("TrainDataElement")
export class TrainDataElement {
    @JsonProperty("trainServer", String)
    trainServer: string | null = null
    @JsonProperty("projectName", String)
    projectName: string | null = null
    @JsonProperty("exeServer", String)
    exeServer: string | null = null
}
@JsonObject("TrainData")
export class TrainData {
    @JsonProperty("projects", [TrainDataElement])
    projects: TrainDataElement[] | null = null
}