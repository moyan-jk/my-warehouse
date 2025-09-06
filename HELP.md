# 项目帮助文档

## 项目简介
本项目是一个包含前端页面和版本管理功能的应用程序，主要用于展示和管理分期借款列表，并提供版本控制机制。

## 文档说明

### 1. 版本管理相关文档

#### version.json
- **用途**：存储项目版本信息和更新日志
- **位置**：`d:\TRAE11111\version.json`
- **格式**：JSON格式，包含当前版本号和更新日志数组
- **示例内容**：
```json
{
  "version": "1.0.1",
  "updateLog": [
    {
      "version": "1.0.1",
      "date": "2025-09-06",
      "changes": [
        "设置了版本号管理机制，创建了自动更新脚本"
      ]
    },
    {
      "version": "1.0.0",
      "date": "2025-09-05",
      "changes": [
        "初始版本发布"
      ]
    }
  ]
}
```

#### update_version.js
- **用途**：自动更新版本号和记录更新日志的JavaScript脚本
- **位置**：`d:\TRAE11111\update_version.js`
- **功能**：支持major、minor、patch三种类型的版本更新，并自动记录更新内容
- **运行方式**：
```bash
node update_version.js <更新类型> <更新说明>
```
- **参数说明**：
  - `<更新类型>`: 可选值为major、minor、patch
    - major: 主版本号增加（如1.0.0 -> 2.0.0）
    - minor: 次版本号增加（如1.0.0 -> 1.1.0）
    - patch: 补丁版本号增加（如1.0.0 -> 1.0.1）
  - `<更新说明>`: 描述本次更新的内容
- **示例**：
```bash
node update_version.js patch "修复了分期借款列表表头对齐问题"
```

#### update_version.bat
- **用途**：方便Windows用户快速更新版本的批处理文件
- **位置**：`d:\TRAE11111\update_version.bat`
- **运行方式**：
```cmd
update_version.bat <更新类型> <更新说明>
```
- **参数说明**：与update_version.js相同
- **示例**：
```cmd
update_version.bat minor "添加了总利息、已还利息和剩余期数列"
```
> 注意：在PowerShell中运行时，需要使用`.\update_version.bat`前缀

### 2. Git配置参考文档

#### git-config-cheatsheet.md
- **用途**：记录Git配置相关的常用命令和设置
- **位置**：`d:\TRAE11111\git-config-cheatsheet.md`

### 3. 语法维护文档

#### syntax_maintenance.md
- **用途**：记录代码语法维护的相关说明和准则
- **位置**：`d:\TRAE11111\syntax_maintenance.md`

## 常用命令

### 启动项目
```bash
cd d:\TRAE11111\original
node server.js
```

### Git相关操作
- 检查Git状态：
```bash
git status
```

- 添加文件到暂存区：
```bash
git add <文件名>
```

- 提交更改：
```bash
git commit -m "提交信息"
```

- 推送至远程仓库：
```bash
git push origin main
```

## 版本更新记录
请参考version.json文件中的updateLog数组

## 联系信息
如有问题，请联系项目维护人员。