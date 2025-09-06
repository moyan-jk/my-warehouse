const fs = require('fs');
const path = require('path');

// 版本更新类型: major, minor, patch
const updateType = process.argv[2] || 'patch';
const changes = process.argv.slice(3).join(' ');

if (!changes) {
  console.error('请提供更新说明，例如: node update_version.js patch "修复了XX问题"');
  process.exit(1);
}

// 读取版本文件
const versionFilePath = path.join(__dirname, 'version.json');
let versionData;

try {
  const data = fs.readFileSync(versionFilePath, 'utf8');
  versionData = JSON.parse(data);
} catch (err) {
  console.error('无法读取version.json文件:', err.message);
  process.exit(1);
}

// 解析当前版本号
const [major, minor, patch] = versionData.version.split('.').map(Number);
let newMajor = major;
let newMinor = minor;
let newPatch = patch;

// 根据更新类型增加版本号
switch (updateType) {
  case 'major':
    newMajor += 1;
    newMinor = 0;
    newPatch = 0;
    break;
  case 'minor':
    newMinor += 1;
    newPatch = 0;
    break;
  case 'patch':
  default:
    newPatch += 1;
    break;
}

const newVersion = `${newMajor}.${newMinor}.${newPatch}`;
const today = new Date().toISOString().split('T')[0]; // 格式: YYYY-MM-DD

// 更新版本信息和日志
versionData.version = newVersion;
versionData.updateLog.unshift({
  version: newVersion,
  date: today,
  changes: [changes]
});

// 写回文件
try {
  fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8');
  console.log(`版本已更新至 ${newVersion}`);
  console.log('更新日志已记录');
} catch (err) {
  console.error('无法写入version.json文件:', err.message);
  process.exit(1);
}