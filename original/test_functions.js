// 测试函数，用于生成测试数据
function test() {
    console.log('测试函数被调用');
    
    // 生成测试数据
    if (debtData.nextMonthLoans.length === 0) {
        // 添加一些测试借款
        addNextMonthLoan('支付宝', 1000, formatDate(new Date()), formatDate(new Date(Date.now() + 30*24*60*60*1000)), 10.0, 10.0, '测试借款');
        addNextMonthLoan('微信', 2000, formatDate(new Date()), formatDate(new Date(Date.now() + 30*24*60*60*1000)), 12.0, 10.0, '测试借款');
        addNextMonthLoan('信用卡', 3000, formatDate(new Date()), formatDate(new Date(Date.now() + 30*24*60*60*1000)), 15.0, 10.0, '测试借款');
        
        // 添加一些分期借款
        addInstallmentLoan('银行贷款', 12000, 12, 0.06, 1032, formatDate(new Date()), formatDate(new Date(Date.now() + 30*24*60*60*1000)), '测试分期借款');
        
        // 添加一些还款记录
        if (debtData.nextMonthLoans.length > 0) {
            const loanId = debtData.nextMonthLoans[0].id;
            addPaymentRecord(loanId, 'nextMonth', 100, 'minimum', '测试最低还款');
            addPaymentRecord(loanId, 'nextMonth', 600, 'custom', '测试自定义还款');
        }
        
        alert('测试数据生成成功');
        renderNextMonthLoans();
        renderInstallmentLoans();
        renderPaymentRecords();
        updateSummary();
        updateCharts();
    } else {
        alert('已有测试数据，如需重新生成，请先重置数据');
    }
}

// 确保函数暴露到全局作用域
window.test = test;

// 在index.html中添加测试按钮点击事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const testBtn = document.createElement('button');
    testBtn.id = 'testBtn';
    testBtn.className = 'btn btn-primary mt-2';
    testBtn.textContent = '生成测试数据';
    testBtn.onclick = test;
    
    // 将按钮添加到页面中
    const container = document.querySelector('.container');
    if (container) {
        container.appendChild(testBtn);
    }
});