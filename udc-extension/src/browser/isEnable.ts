import { inject, injectable } from "inversify";

@injectable()
export class UI_Setting{
    remoteBurnStatus:boolean=false
    remoteCompileStatus:boolean=false
    ldcShellStatus:boolean=false
    linkedgeViewStatus:boolean=false
    linkedgeCompileStatus:boolean=false
    onlineIOTSystem:boolean =false
    esp32Status:boolean=false
    arduinoStatus:boolean=false 
    haas100Status:boolean=false
    localBurnStatus:boolean=false   

    setExperiment(){
        console.log("set experiment")
        this.remoteBurnStatus=false
        this.remoteCompileStatus=false
        this.ldcShellStatus=false
        this.linkedgeViewStatus=false
        this.linkedgeCompileStatus=false
        this.onlineIOTSystem =false
        this.esp32Status=false
        this.arduinoStatus=false 
        this.haas100Status=false
        this.localBurnStatus=false   
    }
    setFreeCoding(){
        console.log("set Freecoding")
        this.remoteBurnStatus=true
        this.remoteCompileStatus=true
        this.ldcShellStatus=true
        this.linkedgeViewStatus=false
        this.linkedgeCompileStatus=false
        this.onlineIOTSystem =false
        this.esp32Status=true
        this.arduinoStatus=true 
        this.haas100Status=true
        this.localBurnStatus=true
    }
    setLinkedge(){
        console.log("set linkedge ui")
        this.remoteBurnStatus=false
        this.remoteCompileStatus=false
        this.ldcShellStatus=true
        this.linkedgeViewStatus=true
        this.linkedgeCompileStatus=true
        this.onlineIOTSystem =false
        this.esp32Status=false
        this.arduinoStatus=false 
        this.haas100Status=false
        this.localBurnStatus=false   
    }
    setVirtualScene(){
        console.log("set virtual scene")
        this.remoteBurnStatus=false
        this.remoteCompileStatus=false
        this.ldcShellStatus=true
        this.linkedgeViewStatus=false
        this.linkedgeCompileStatus=false
        this.onlineIOTSystem =false
        this.esp32Status=false
        this.arduinoStatus=false 
        this.haas100Status=false
        this.localBurnStatus=false   
    }
    setTaoFactory(){
        console.log("set tao factory")
      this.setVirtualScene()
    }
    setAI(){
        this.setTaoFactory()
    }
}