// 测试文件，用于验证修复后的功能

// 测试服务器是否正常工作
function testServer() {
    console.log('测试服务器连接...');
    fetch('http://localhost:8000')
        .then(response => {
            if (response.ok) {
                console.log('服务器连接成功!');
                return response.text();
            } else {
                console.error('服务器连接失败:', response.status);
            }
        })
        .then(html => {
            if (html) {
                console.log('成功获取首页内容，长度:', html.length);
            }
        })
        .catch(error => {
            console.error('服务器测试失败:', error);
        });
}

// 测试数据初始化
function testDataInit() {
    console.log('测试数据初始化...');
    try {
        // 尝试初始化数据
        const testData = {
            nextMonthLoans: [],
            installmentLoans: [],
            paymentRecords: [],
            platforms: ['花呗', '信用卡', '美团月付', '美团借钱', '放心借', '借呗', '其他'],
            minPaymentRate: 0.1
        };
        localStorage.setItem('debtRecords', JSON.stringify(testData));
        console.log('数据初始化测试成功!');
        return true;
    } catch (error) {
        console.error('数据初始化测试失败:', error);
        return false;
    }
}

// 运行所有测试
function runAllTests() {
    console.log('开始运行所有测试...');
    testDataInit();
    testServer();
    console.log('测试完成!');
}

// 当页面加载完成后运行测试
if (typeof window !== 'undefined') {
    window.addEventListener('load', runAllTests);
} else {
    // 在Node.js环境中运行
    console.log('在Node.js环境中运行测试...');
    testDataInit();
    console.log('Node.js环境测试完成! 服务器测试需要在浏览器中运行。');
}