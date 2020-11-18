# WEBIDE是基于 Theia (一个基于typescript 版本react的框架)的Web程序

---

## 环境

    安装npm
    安装nvm
    安装yarn
    安装node11
---

## 启动

    于项目根目录下yarn install 安装依赖
    执行./b编译以及打包生成的js文件,并启动
---

## 开发

    theia 支持两种形式的开发
            1. plugin:theia 提供了一些系统函数,用户可调用进行plugin开发.
            2. extension:主要是基于@theia/core下的预定义的一些类进行开发.
---

## 基础

    typescript &  inversify & react &nodejs
---
## 问题
文件模板创建：应该是先创建好项目，里面应包含了编译信息，然后webide 打开,
编译服务：webide 打包 好代码 ，由编译服务统一处理

##Theia 前端页面的构建，基于@phosphor这个库实现 ,react其实是提供了一种简单操作dom的方法