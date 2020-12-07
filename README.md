# WEBIDE是基于 Theia (一个基于typescript 版本react的框架)的Web程序、可参考https://theia-ide.org/docs/的开发过程

---

## 环境

    安装node 11.15.0版本

    安装yarn 使用命令  npm install -g yarn

---

## 启动

    于根目录下使用命令 yarn install 安装依赖
    于根目录下执行./c将会编译并启动项目
---

## 问题

    第一次安装可能因为网络，导致某些模块安装不上，导致报错发生，可以中断后重试
    修改代码编译后有时可能看不到修改的结果，可以使用yarn prepare命令

## 开发

    theia 支持两种形式的开发
            1. plugin:theia 提供了一些系统函数,用户可调用进行plugin开发.
            2. extension:主要是基于@theia/core下的预定义的一些类进行开发.
    
    修改代码后使用./c重新编译项目 
---

## 部署

    在项目根目录下使用yarn 安装项目依赖
    使用./c编译整个项目
    使用./clean.sh清理整个项目    
    使用docker build -t webidelatest 命令建立docker镜像
    使用./deploy.sh 部署

## 基础

    typescript &  inversify & react &nodejs
---

## 文件夹作用

    browser目录负责存放Web端编译好的代码
    demo Linkedge视图扩展
    doc 存放文档
    drawboard-extension 画板扩展
    esp32_widget esp32扩展
    grove-extension 淘工厂扩展
    new_widget ardunio扩展
    node_modules 存放依赖
    plugin 存放插件
    script 存放项目脚本
    udc-extension 题目系统扩展

## 基本功能

    集成各个在线编译、远程设备等系统实现基本的集成开发环境功能

## 开发者

    梁赋奇、蓝云甫
