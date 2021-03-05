/*
 * Copyright (C) 2018-present Alibaba Group Holding Limited
 */

import { CommonCommands } from '@theia/core/lib/browser';
import { FrontendApplicationConfigProvider } from '@theia/core/lib/browser/frontend-application-config-provider';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
// import { CommandRegistry, environment, isOSX } from '@theia/core/lib/common';
import { CommandRegistry } from '@theia/core/lib/common';
import { ApplicationInfo, ApplicationServer } from '@theia/core/lib/common/application-protocol';
import { FileStat, FileSystem } from '@theia/filesystem/lib/common/filesystem';
// import { FileSystemUtils } from '@theia/filesystem/lib/common/filesystem-utils';
import { KeymapsCommands } from '@theia/keymaps/lib/browser';
// import { WorkspaceCommands, WorkspaceService } from '@theia/workspace/lib/browser';
//import { ProjectCommands } from 'hacklab-project/lib/browser/project-commands';
//import Haas from "./Haas";
import WorkSpace from "./Workspace";
import URI from '@theia/core/lib/common/uri';
import { inject, injectable, postConstruct } from 'inversify';
import * as React from 'react';
import { BackendClient, GuildBackendService, GuildBackendServiceSymbol } from '../common/protocol';

@injectable()
export class GettingStartedWidget extends ReactWidget {

  public static readonly ID = 'help.getting.started.widget';
  public static readonly LABEL = 'Getting Started';
  protected applicationInfo: ApplicationInfo | undefined;
  protected applicationName = FrontendApplicationConfigProvider.get().applicationName;
  protected stat: FileStat | undefined;
  protected home: string | undefined;
  protected readonly recentLimit = 5;
  protected recentWorkspaces: string[] = [];

  //注入后端对象
  @inject(GuildBackendServiceSymbol)
  protected gbs:GuildBackendService;

  protected readonly deviceDriverUrl = 'https://gaic.alicdn.com/doc/hacklab/hqqro6.html';
  protected readonly deviceAgentUrl = 'https://gaic.alicdn.com/doc/hacklab/duaucu.html';
  protected readonly iotLinkPlatformUrl = 'https://help.aliyun.com/document_detail/73705.html';
  protected readonly ramAkConfigUrl = 'https://gaic.alicdn.com/doc/hacklab/xatnhr.html#b9dbbcf5';
  protected readonly overviewUrl = 'https://gaic.alicdn.com/doc/hacklab/index.html';
  protected readonly tutorialUnoBlinkUrl = 'https://gaic.alicdn.com/doc/hacklab/bx0tqw.html';
  protected readonly tutorialUnoAliyunUrl = 'https://dev.iot.aliyun.com/demo/detail/169050';
  protected readonly tutorial8266AliyunUrl = 'https://dev.iot.aliyun.com/demo/detail/282841';
  protected readonly tutorialHelloWorldUrl = 'https://gaic.alicdn.com/doc/hacklab/kg90ri.html';
  protected readonly faqUrl = 'https://gaic.alicdn.com/doc/hacklab/kipdcg.html';
  protected readonly communityUrl = 'https://dev.iot.aliyun.com/';
  protected readonly projectCloneUrl = 'https://gaic.alicdn.com/doc/hacklab/rx3p87.html#3e4c48af';
  protected readonly releaseNote0_9_0Url = 'https://gaic.alicdn.com/doc/hacklab/hvlspk.html';
  protected readonly releaseNote0_10_0Url = 'https://gaic.alicdn.com/doc/hacklab/kldlte.html';

  @inject(ApplicationServer)
  protected readonly appServer: ApplicationServer;
  @inject(CommandRegistry)
  protected readonly commandRegistry: CommandRegistry;
  @inject(FileSystem)
  protected readonly fileSystem: FileSystem;
  // @inject(WorkspaceService)
  // protected readonly workspaceService: WorkspaceService;
  
  
  @postConstruct()
  protected async init(): Promise<void> {
    this.id = GettingStartedWidget.ID;
    this.title.label = GettingStartedWidget.LABEL;
    this.title.caption = GettingStartedWidget.LABEL;
    this.title.closable = true;
    this.applicationInfo = await this.appServer.getApplicationInfo();
    // this.recentWorkspaces = await this.workspaceService.recentWorkspaces();
    this.stat = await this.fileSystem.getCurrentUserHome();
    //this.home = (this.stat) ? new URI(this.stat.uri).withoutScheme().toString() : undefined;
    this.home = (this.stat) ? new URI(this.stat.uri).toString() : undefined;
    this.update();
  }

  protected render(): React.ReactNode {
    return <div className='gs-container'>
      {/* {this.renderHeader()}
      <hr className='gs-hr' />
      <div className='flex-grid'>
        <div className='col'>
          {this.renderGuide()}
        </div>
        <div className='col'>
          {this.renderTutorials()}
        </div>
      </div> */}
      <WorkSpace projectCreation = {this.projectCreation.bind(this)}/>
    </div>;
  }

  protected projectCreation(config_json:string):void{
    //console.log("gbs是否存在:" + this.gbs.test().toString);
    //console.log(this.id);
    this.gbs.createProject(JSON.stringify(config_json));
  }
  protected renderHeader(): React.ReactNode {
    return <div className='gs-header'>
      <h1>{this.applicationName}<span className='gs-sub-header'> Cloud Ladder for Embedded Developers</span></h1>
    </div>;
  }

  protected renderGuide(): React.ReactNode {
    return <div className='gs-section'>
      {this.renderSectionHeader('Before you start', 'fa fa-info-circle')}
      {this.renderLink('1. Install device drivers to enable your device on PC', this.deviceDriverUrl)}
      {this.renderLink('2. Download and run device agent to connect device to cloud IDE', this.deviceAgentUrl)}
      {this.renderLink('3. Create a product and a device on Alibaba Cloud IoT Platform', this.iotLinkPlatformUrl)}
      {this.renderLink('4. Configure RAM user access key for Alibaba Cloud IoT Platform', this.ramAkConfigUrl)}
    </div>;
  }

  protected renderTutorials(): React.ReactNode {
    return <div className='gs-section'>
      {this.renderSectionHeader('Study', 'fa fa-user-circle-o')}
      {this.renderLink('Arduino Blink', this.tutorialUnoBlinkUrl)}
      {this.renderLink('Arduino UNO for IoT', this.tutorialUnoAliyunUrl)}
      {this.renderLink('STM32 AliOS-Things Hello World', this.tutorialHelloWorldUrl)}
      {this.renderLink('NodeMCU + Arduino for IoT', this.tutorial8266AliyunUrl)}
    </div>;
  }

  protected renderGettingStarted(): React.ReactNode {
    return <div className='gs-section'>
      {this.renderSectionHeader('Getting Started with a Project', 'fa fa-play-circle')}
      {this.renderLink('Create a project', '#')}
      {this.renderLink('Clone a project from git', this.projectCloneUrl)}
    </div>;
  }

  protected renderReleaseInfo(): React.ReactNode {
    return <div className='gs-section'>
      {this.renderSectionHeader('Release Note', 'fa fa-paper-plane-o aria-hidden="true"')}
      {this.renderLink('0.10.0 (April 15, 2019)', this.releaseNote0_10_0Url)}
      {this.renderLink('0.9.0 (March 5, 2019)', this.releaseNote0_9_0Url)}
    </div>;
  }

  protected renderSettings(): React.ReactNode {
    return <div className='gs-section'>
      {this.renderSectionHeader('Settings', 'fa fa-cog')}
      {this.renderLink('Preferences', '#', this.doOpenPreferences)}
      {this.renderLink('Keyboard Shortcuts', '#', this.doOpenKeyboardShortcuts)}
    </div>;
  }

  protected renderHelp(): React.ReactNode {
    return <div className='gs-section'>
      {this.renderSectionHeader('Help', 'fa fa-question-circle')}
      {this.renderLink('FAQ', this.faqUrl)}
      {this.renderLink('Developer Community', this.communityUrl)}
      <div className='gs-action-container'>
        <img
          src='https://gaic.alicdn.com/doc/hacklab/images/1551329194777-62df7311-6b0a-48d0-8920-fcb5310c6023.png'
          alt='Hacklab DingTalk Group'
          width='150'
          height='200' />
      </div>
    </div>;
  }

  private renderSectionHeader(label: string, iconClass: string) {
    return (
      <h3 className='gs-section-header'>
        <i className={iconClass} />
        {label}
      </h3>
    );
  }

  private renderLink(label: string, href: string, onClick?: () => void) {
    return (
      <div className='gs-action-container'>
        {
          onClick ? <a href={href} onClick={onClick}>{label}</a> : <a href={href} target='_blank'>{label}</a>
        }
      </div>
    );
  }

  // protected renderOpen(): React.ReactNode {
  //   const requireSingleOpen = isOSX || !environment.electron.is();
  //   const open = (requireSingleOpen) ? <div className='gs-action-container'><a href='#' onClick={this.doOpen}>Open</a></div> : '';
  //   const openFile = (!requireSingleOpen) ? <div className='gs-action-container'><a href='#' onClick={this.doOpenFile}>Open File</a></div> : '';
  //   const openFolder = (!requireSingleOpen) ? <div className='gs-action-container'><a href='#' onClick={this.doOpenFolder}>Open Folder</a></div> : '';
  //   const openWorkspace = <a href='#' onClick={this.doOpenWorkspace}>Open Workspace</a>;
  //   return <div className='gs-section'>
  //     <h3 className='gs-section-header'><i className='fa fa-folder-open'></i>Open</h3>
  //     {open}
  //     {openFile}
  //     {openFolder}
  //     {openWorkspace}
  //   </div>;
  // }

  // protected renderRecentWorkspaces(): React.ReactNode {
  //   const items = this.recentWorkspaces;
  //   const paths = this.buildPaths(items);
  //   const content = paths.slice(0, this.recentLimit).map((item, index) =>
  //     <div className='gs-action-container' key={index}>
  //       <a href='#' onClick={a => this.open(new URI(items[index]))}>{new URI(items[index]).path.base}</a>
  //       <span className='gs-action-details'>
  //         {item}
  //       </span>
  //     </div>
  //   );
  //   const more = (paths.length > this.recentLimit) ? <div className='gs-action-container'>
  //     <a href='#' onClick={this.doOpenRecentWorkspace}>More...</a>
  //   </div> : <div />;
  //   return <div className='gs-section'>
  //     <h3 className='gs-section-header'>
  //       <i className='fa fa-clock-o'></i>Recent Workspaces
  //     </h3>
  //     {(items.length > 0) ? content : <p className='gs-no-recent'>No Recent Workspaces</p>}
  //     {more}
  //   </div>;
  // }

  // protected renderVersion(): React.ReactNode {
  //   return <div className='gs-section'>
  //     <div className='gs-action-container'>
  //       <p className='gs-sub-header' >
  //         {this.applicationInfo ? `Version: ${this.applicationInfo.version.split('-')[0]}` : ''}
  //       </p>
  //     </div>
  //   </div>;
  // }

  // protected buildPaths(workspaces: string[]): string[] {
  //   const paths: string[] = [];
  //   workspaces.forEach(workspace => {
  //     const uri = new URI(workspace);
  //     const path = (this.home) ? FileSystemUtils.tildifyPath(uri.path.toString(), this.home) : uri.path.toString();
  //     paths.push(path);
  //   });
  //   return paths;
  // }

  // protected doOpen = () => this.commandRegistry.executeCommand(WorkspaceCommands.OPEN.id);
  // protected doOpenFile = () => this.commandRegistry.executeCommand(WorkspaceCommands.OPEN_FILE.id);
  // protected doOpenFolder = () => this.commandRegistry.executeCommand(WorkspaceCommands.OPEN_FOLDER.id);
  // protected doOpenWorkspace = () => this.commandRegistry.executeCommand(WorkspaceCommands.OPEN_WORKSPACE.id);
  // protected doOpenRecentWorkspace = () => this.commandRegistry.executeCommand(WorkspaceCommands.OPEN_RECENT_WORKSPACE.id);
  protected doOpenPreferences = () => this.commandRegistry.executeCommand(CommonCommands.OPEN_PREFERENCES.id);
  protected doOpenKeyboardShortcuts = () => this.commandRegistry.executeCommand(KeymapsCommands.OPEN_KEYMAPS.id);
  // protected open = (workspace: URI) => this.workspaceService.open(workspace);
  //protected doOpenProject = () => this.commandRegistry.executeCommand(ProjectCommands.CREATE_PROJECT.id);
}

@injectable()
export class BackendClientImpl implements BackendClient {
   //打开文件的工作空间
   openWorkSpace = (urlStr: string) => {
       
  };
}