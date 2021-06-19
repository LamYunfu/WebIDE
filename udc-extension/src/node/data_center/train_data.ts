import { injectable } from "inversify";
import { JsonObject, JsonProperty } from "json2typescript";
//这里定义了人工智能实验config.json 的模板
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