@echo off

if "%~1" == "" (
  echo 请提供更新类型: major, minor, 或 patch
  echo 例如: update_version.bat patch "修复了XX问题"
  exit /b 1
)

if "%~2" == "" (
  echo 请提供更新说明
  echo 例如: update_version.bat patch "修复了XX问题"
  exit /b 1
)

node %~dp0update_version.js %1 %2

if %ERRORLEVEL% EQU 0 (
  echo 版本更新成功!
) else (
  echo 版本更新失败!
  exit /b 1
)