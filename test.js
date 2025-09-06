// 测试脚本，用于检查导入导出功能

// 添加runTests函数，供index.html中的测试按钮调用

// 脚本已通过index.html引入，无需再次添加到页面
console.log('测试脚本已加载并准备就绪');

// 移除了页面加载完成后的自动测试代码，避免打开应用后直接弹窗
// 如需测试，请点击页面上的测试按钮
function runTests() {
    console.log('手动触发测试...');
    // 测试导出功能
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.click();
        console.log('导出按钮点击完成');
    } else {
        console.error('未找到导出按钮');
    }

    // 测试导入功能
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.click();
        console.log('导入按钮点击完成');
    } else {
        console.error('未找到导入按钮');
    }
}