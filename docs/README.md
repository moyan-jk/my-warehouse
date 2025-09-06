# 项目文档索引

本目录包含项目的所有文档，按功能分类整理如下：

## 用户指南 (user_guide)
- [HELP.md](user_guide/HELP.md)：项目使用帮助文档，包含各功能模块的使用方法和运行代码

## 开发指南 (dev_guide)
- [syntax_maintenance.md](dev_guide/syntax_maintenance.md)：代码语法维护文档，记录代码规范和维护准则

## 版本控制 (version_control)
- [update_version.bat](version_control/update_version.bat)：Windows批处理文件，用于快速更新版本
- [update_version.js](version_control/update_version.js)：JavaScript脚本，支持major、minor、patch三种类型的版本更新
- [version.json](version_control/version.json)：存储版本信息和更新日志的JSON文件

## Git配置 (git_config)
- [git-config-cheatsheet.md](git_config/git-config-cheatsheet.md)：Git配置参考文档，记录常用Git命令和设置

## 使用说明
1. 用户指南：适合项目用户阅读，了解如何使用项目功能
2. 开发指南：适合开发人员阅读，了解代码规范和维护方法
3. 版本控制：包含版本更新相关工具和配置
4. Git配置：包含Git相关配置和命令参考

## 如何更新文档
1. 按照文档类型将新文档放入相应目录
2. 更新本索引文件，添加新文档的链接和说明
3. 提交到Git仓库以同步更新