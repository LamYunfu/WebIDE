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
    localBurnStatus:boolean=false   

    setExperiment(){
        this.remoteBurnStatus=false
        this.remoteCompileStatus=false
        this.ldcShellStatus=false
        this.linkedgeViewStatus=false
        this.linkedgeCompileStatus=false
        this.onlineIOTSystem =false
        this.esp32Status=false
        this.arduinoStatus=false 
        this.localBurnStatus=false   
    }
    setFreeCoding(){
        this.remoteBurnStatus=true
        this.remoteCompileStatus=true
        this.ldcShellStatus=true
        this.linkedgeViewStatus=false
        this.linkedgeCompileStatus=false
        this.onlineIOTSystem =false
        this.esp32Status=true
        this.arduinoStatus=true 
        this.localBurnStatus=true
    }
    setLinkedge(){
        this.remoteBurnStatus=false
        this.remoteCompileStatus=false
        this.ldcShellStatus=true
        this.linkedgeViewStatus=true
        this.linkedgeCompileStatus=true
        this.onlineIOTSystem =false
        this.esp32Status=false
        this.arduinoStatus=false 
        this.localBurnStatus=false   
    }
    setVirtualScene(){
        this.remoteBurnStatus=false
        this.remoteCompileStatus=false
        this.ldcShellStatus=true
        this.linkedgeViewStatus=false
        this.linkedgeCompileStatus=false
        this.onlineIOTSystem =false
        this.esp32Status=false
        this.arduinoStatus=false 
        this.localBurnStatus=false   
    }
    setTaoFactory(){
      this.setVirtualScene()
    }
    setAI(){
        this.setTaoFactory()
    }
}