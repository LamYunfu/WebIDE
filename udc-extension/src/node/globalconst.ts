import { Logger } from "./util/logger";
export const rootDir = "/home/project"
export const hexFileDir = "hexFiles"
export const getCompilerType = (model: string): string => {
    Logger.info("the model is:" + model)
    const AliosType = ["ble", "developer_kit"]
    const TinylinkType = ["lora_p2p", "mega_sd"]
    if (model.startsWith("alios") || AliosType.indexOf(model) != -1 || model.split("AliOS").length > 1 || model.split("阿里云").length > 1) {
        return "alios"
    }
    if (model.startsWith("tinylink") || TinylinkType.indexOf(model) != -1) {
        return "tinylink"
    }
    if (model == "contiki-telosb")
        return "contiki"
    Logger.info("get compiler type failed")
    return "No this type"
}
export const getBoardType = (model: string): string => {
    if (model == "developer_kit")
        return 'developerkit'
    else if (model == "contiki-telosb")
        return 'sky'
    else
        return 'esp32devkitc'
}

