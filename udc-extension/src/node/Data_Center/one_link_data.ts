import { JsonObject, JsonProperty } from 'json2typescript';
import { injectable } from "inversify";
@JsonObject("OneLinkDataElement")
export class OneLinkDataElement {
    @JsonProperty("projectName", String)
    projectName: String | null = null
    @JsonProperty("simServer", String)
    simServer: string | null = null
}
@injectable()
@JsonObject("OneLinkData")
export class OneLinkData {
    @JsonProperty("projects", [OneLinkDataElement])
    projects: OneLinkDataElement[] | null = null
}
