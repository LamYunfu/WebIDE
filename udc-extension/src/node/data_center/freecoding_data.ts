import { injectable } from "inversify";
import { JsonObject, JsonProperty } from "json2typescript";
//这是一个使用了json2typescript来解析config json 的文件 这里定义了解析的模板

// export type QueueConfigSetting = {
//   version: "1.0.0";
//   usage: "queue";
//   hexFileDir: "hexFiles";
//   serverType: "tinylink_platform_1";
//   projects: [
//     {
//       projectName: "tinylink";
//       compileType: "tinylink";
//       boardType: "tinylink";
//       burnType: "queue";
//       program: {
//         model: "tinylink_platform_1";
//         runtime: 60;
//         address: "0x10000";
//       };
//     }
//   ];
// };

@JsonObject("QueueBurnDetail")
class QueueBurnDetail {
  @JsonProperty("model", String)
  model: string | null = null;
  @JsonProperty("runtime", Number)
  runtime: number | null = null;
  @JsonProperty("address", String)
  address: string | null = null;
}

@JsonObject("AdhocBurnDetail")
class AdhocBurnDetail {
  @JsonProperty("clientId", String)
  clientId: string | null = null;
  @JsonProperty("devPort", String)
  devPort: string | null = null;
  @JsonProperty("runtime", Number)
  runtime: number | null = null;
  @JsonProperty("address", String)
  address: string | null = null;
}
@JsonObject("QueueDetail")
class QueueDetail {
  @JsonProperty("projectName", String)
  projectName: string | null = null;
  @JsonProperty("compileType", String)
  compileType: string | null = null;
  @JsonProperty("boardType", String)
  boardType: string | null = null;
  @JsonProperty("burnType", String)
  burnType: string | null = null;
  @JsonProperty("program", QueueBurnDetail)
  program: QueueBurnDetail | null = null;
}
@JsonObject("AdhocDetail")
class AdhocDetail {
  @JsonProperty("projectName", String)
  projectName: string | null = null;
  @JsonProperty("compileType", String)
  compileType: string | null = null;
  @JsonProperty("boardType", String)
  boardType: string | null = null;
  @JsonProperty("burnType", String)
  burnType: string | null = null;
  @JsonProperty("program", AdhocBurnDetail)
  program: AdhocBurnDetail | null = null;
  @JsonProperty("modifyOSCore",Boolean,true)
  modifyOSCore:boolean|null=false
}
@JsonObject("QueueSetting")
export class QueueSetting {
  @JsonProperty("version", String)
  version: string | null = null;
  @JsonProperty("usage", String)
  usage: string | null = null;
  @JsonProperty("hexFileDir", String)
  hexFileDir: string | null = null;
  @JsonProperty("serverType", String)
  serverType: string | null = null;
  @JsonProperty("language", String, true)
  language: string | null = null;
  @JsonProperty("projects", [QueueDetail])
  projects: QueueDetail[] | null = null;
  @JsonProperty("modifyOSCore",Boolean,true)
  modifyOSCore:boolean|null=false
}
@JsonObject("AdhocSetting")
export class AdhocSetting {
  @JsonProperty("version", String)
  version: string | null = null;
  @JsonProperty("usage", String)
  usage: string | null = null;
  @JsonProperty("hexFileDir", String)
  hexFileDir: string | null = null;
  @JsonProperty("serverType", String)
  serverType: string | null = null;
  @JsonProperty("language", String, true)
  language: string | null = null;
  @JsonProperty("projects", [AdhocDetail])
  projects: AdhocDetail[] | null = null;
  @JsonProperty("modifyOSCore",Boolean)
  modifyOSCore:boolean|null=false
}
// export class AdhocConfigSetting {
//   version!: string;
//   usage!: string;
//   hexFileDir!: string;
//   serverType!: string;
//   projects!: [
//     {
//       projectName: string;
//       compileType: string;
//       boardType: string;
//       burnType: string;
//       program: {
//         model: string;
//         runtime: number;
//         address: string;
//         clientId: string;
//         devPort: string;
//       };
//     }
//   ];
// }
@injectable()
export class FreeCodingData {
  deviceUsage: string = "QUEUE";
  hexFileDir: string = "hexFiles";
  projects: { [key: string]: any }[] = [
    {
      projectName: "tinylink",
      deviceType: "tinylink_platform_1",
      deviceName: "tinylink_platform_1",
      compilationMethod: "tinylink",
      burningDataQueue: {
        type: "QUEUE",
        program: {
          model: "tinylink_platform_1",
          runtime: 60,
          address: "0x10000",
        },
      },
    },
  ];
}
