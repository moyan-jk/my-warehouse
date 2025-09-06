// 详细测试脚本，用于诊断核心功能问题

console.log('======= 核心功能测试开始 =======');

// 测试函数：检查元素是否存在
function testElementExists(selector, description) {
    const element = document.querySelector(selector);
    if (element) {
        console.log(`✓ 成功: ${description} 元素存在`);
        return element;
    } else {
        console.error(`✗ 失败: ${description} 元素不存在`);
        return null;
    }
}

// 测试函数：检查函数是否存在
function testFunctionExists(funcName, description) {
    if (window[funcName] && typeof window[funcName] === 'function') {
        console.log(`✓ 成功: ${description} 函数存在`);
        return window[funcName];
    } else {
        console.error(`✗ 失败: ${description} 函数不存在`);
        return null;
    }
}

// 测试函数：检查数据是否初始化
function testDataInitialization() {
    if (window.debtData) {
        console.log(`✓ 成功: 数据已初始化`);
        console.log('数据结构:', {
            nextMonthLoans: window.debtData.nextMonthLoans.length,
            installmentLoans: window.debtData.installmentLoans.length,
            platforms: window.debtData.platforms.length
        });
        return true;
    } else {
        console.error(`✗ 失败: 数据未初始化`);
        return false;
    }
}

// 执行测试
function runDetailedTests() {
    console.log('\n--- 元素存在性测试 ---');
    const exportBtn = testElementExists('#exportBtn', '导出按钮');
    const importBtn = testElementExists('#importBtn', '导入按钮');
    const resetBtn = testElementExists('#resetBtn', '重置按钮');
    const nextMonthForm = testElementExists('#nextMonthForm', '添加借款表单');
    const installmentForm = testElementExists('#installmentForm', '分期还款表单');
    const importModal = testElementExists('#importModal', '导入模态框');

    console.log('\n--- 函数存在性测试 ---');
    const exportData = testFunctionExists('exportData', '导出数据');
    const importData = testFunctionExists('importData', '导入数据');
    const resetData = testFunctionExists('resetData', '重置数据');
    const addNextMonthLoan = testFunctionExists('addNextMonthLoan', '添加借款');
    const addInstallmentLoan = testFunctionExists('addInstallmentLoan', '添加分期借款');
    const renderNextMonthLoans = testFunctionExists('renderNextMonthLoans', '渲染借款列表');
    const renderInstallmentLoans = testFunctionExists('renderInstallmentLoans', '渲染分期列表');

    console.log('\n--- 数据初始化测试 ---');
    const dataInitialized = testDataInitialization();

    console.log('\n--- 功能测试总结 ---');
    if (exportBtn && importBtn && resetBtn && nextMonthForm && installmentForm &&
        exportData && importData && resetData && addNextMonthLoan && addInstallmentLoan &&
        renderNextMonthLoans && renderInstallmentLoans && dataInitialized) {
        console.log('✓ 所有核心元素和函数都已加载成功！');
        console.log('提示: 如果功能仍无法使用，可能是事件绑定问题或数据问题。');
    } else {
        console.error('✗ 某些核心元素或函数缺失，请查看上面的详细错误信息。');
    }

    console.log('\n======= 核心功能测试结束 =======');
}

// 页面加载完成后执行测试
window.addEventListener('load', function() {
    console.log('页面加载完成，3秒后开始详细测试...');
    setTimeout(runDetailedTests, 3000);
});

// 暴露测试函数，供手动调用
window.runDetailedTests = runDetailedTests;