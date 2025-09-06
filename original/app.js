// 数据存储和管理
const STORAGE_KEY = 'debtRecords';
const DEFAULT_PLATFORMS = ['花呗', '信用卡', '美团月付', '美团借钱', '放心借', '借呗', '其他'];
const DEFAULT_MIN_PAYMENT_RATE = 0.1; // 默认最低还款比例 10%

// 声明全局变量
globalThis.debtData = null;

// 初始化默认数据结构
function initData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
        const defaultData = {
            nextMonthLoans: [],
            installmentLoans: [],
            paymentRecords: [], // 还款记录
            platforms: DEFAULT_PLATFORMS,
            minPaymentRate: DEFAULT_MIN_PAYMENT_RATE
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return defaultData;
    }
    // 处理旧数据结构，添加缺失字段
    const data = JSON.parse(savedData);
    let dataModified = false;
    
    if (!data.platforms) {
        data.platforms = DEFAULT_PLATFORMS;
        dataModified = true;
    }
    if (!data.paymentRecords) {
        data.paymentRecords = [];
        dataModified = true;
    }
    if (data.minPaymentRate === undefined) {
        data.minPaymentRate = DEFAULT_MIN_PAYMENT_RATE;
        dataModified = true;
    }
    
    if (dataModified) {
        saveData(data);
    }
    
    return data;
}


// 保存数据到localStorage
function saveData(data) {
    try {
        const jsonString = JSON.stringify(data);
        
        if (jsonString === 'undefined') {
            throw new Error('数据无法序列化');
        }

        // 检查localStorage空间
        const estimatedSize = new Blob([jsonString]).size;
        
        if (estimatedSize > 5 * 1024 * 1024) { // 5MB限制
            throw new Error('数据过大，超过localStorage存储限制');
        }

        localStorage.setItem(STORAGE_KEY, jsonString);
        return true;
    } catch (error) {
        throw new Error(`保存数据失败: ${error.message}。请检查浏览器存储空间或数据格式。`);
    }
}

// 平台管理功能
function addPlatform(name) {
    // 验证平台名称不为空且不重复
    if (!name || name.trim() === '') {
        alert('平台名称不能为空');
        return false;
    }
    if (debtData.platforms.includes(name.trim())) {
        alert('该平台名称已存在');
        return false;
    }
    // 不允许修改'其他'平台
    if (name.trim() === '其他') {
        alert('不能添加名为"其他"的平台');
        return false;
    }
    debtData.platforms.push(name.trim());
    saveData(debtData);
    // 更新所有下拉菜单
    updatePlatformDropdowns();
    return true;
}

function deletePlatform(name) {
    // 不允许删除'其他'平台
    if (name === '其他') {
        alert('不能删除"其他"平台');
        return false;
    }
    // 检查是否有借款记录使用该平台
    const isUsedInNextMonth = debtData.nextMonthLoans.some(loan => loan.platform === name);
    const isUsedInInstallment = debtData.installmentLoans.some(loan => loan.platform === name);
    if (isUsedInNextMonth || isUsedInInstallment) {
        alert('该平台已有借款记录，不能删除');
        return false;
    }
    // 确认删除
    if (confirm(`确定要删除平台"${name}"吗？\n\n此操作不可撤销，删除后将无法恢复！`)) {
        // 删除平台
        debtData.platforms = debtData.platforms.filter(platform => platform !== name);
        saveData(debtData);
        // 更新所有下拉菜单
        updatePlatformDropdowns();
        alert(`平台"${name}"已删除！`);
        return true;
    }
    return false;
}

// 通用函数：填充平台下拉菜单
function populatePlatformDropdown(selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    if (selectElement) {
        // 保留当前选中的平台
        const selectedValue = selectElement.value;
        // 清空下拉菜单
        selectElement.innerHTML = '';
        // 添加所有平台选项
        debtData.platforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform;
            if (option.value === selectedValue) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    }
}

function updatePlatformDropdowns() {
    populatePlatformDropdown('nextMonthPlatform');
    populatePlatformDropdown('installmentPlatform');
    populatePlatformDropdown('editNextMonthPlatform');
    populatePlatformDropdown('editInstallmentPlatform');
    // 可以根据需要添加其他需要更新的下拉菜单
}

// 获取当前数据
let debtData = initData();

// 暴露数据到全局作用域，供测试使用
window.debtData = debtData;

// 辅助函数：验证日期是否有效
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// 辅助函数：格式化日期
function formatDate(date) {
    if (!date) return '';
    try {
        const d = new Date(date);
        // 检查是否是有效日期
        if (isNaN(d.getTime())) {
            throw new Error('无效的日期格式');
        }
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('日期格式化错误', error);
        return '';
    }
}

// 表单验证工具函数
function validateForm(form, rules) {
    const errors = [];
    
    for (const fieldName in rules) {
        const field = form.elements[fieldName];
        const fieldRules = rules[fieldName];
        const value = field.value;
        
        // 必填验证
        if (fieldRules.required && (!value || value.trim() === '')) {
            errors.push(`${fieldRules.label || fieldName}不能为空`);
            continue;
        }
        
        // 数字验证
        if (fieldRules.type === 'number' && value) {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                errors.push(`${fieldRules.label || fieldName}必须是数字`);
            } else if (fieldRules.min !== undefined && numValue < fieldRules.min) {
                errors.push(`${fieldRules.label || fieldName}不能小于${fieldRules.min}`);
            } else if (fieldRules.max !== undefined && numValue > fieldRules.max) {
                errors.push(`${fieldRules.label || fieldName}不能大于${fieldRules.max}`);
            } else if (fieldRules.allowNegative !== true && numValue < 0) {
                errors.push(`${fieldRules.label || fieldName}不能为负数`);
            }
        }
        
        // 整数验证
        if (fieldRules.type === 'integer' && value) {
            const intValue = parseInt(value, 10);
            if (isNaN(intValue) || intValue.toString() !== value.trim()) {
                errors.push(`${fieldRules.label || fieldName}必须是整数`);
            } else if (fieldRules.min !== undefined && intValue < fieldRules.min) {
                errors.push(`${fieldRules.label || fieldName}不能小于${fieldRules.min}`);
            } else if (fieldRules.max !== undefined && intValue > fieldRules.max) {
                errors.push(`${fieldRules.label || fieldName}不能大于${fieldRules.max}`);
            } else if (fieldRules.allowNegative !== true && intValue < 0) {
                errors.push(`${fieldRules.label || fieldName}不能为负数`);
            }
        }
        
        // 日期验证
        if (fieldRules.type === 'date' && value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                errors.push(`${fieldRules.label || fieldName}不是有效的日期`);
            }
        }
    }
    
    return errors;
}

// 辅助函数：格式化金额
function formatAmount(amount) {
    return Number(amount).toFixed(2);
}

// 辅助函数：计算还款日期（默认借款日期后一个月）
function calculateRepayDate(borrowDate) {
    if (!borrowDate) return '';
    const d = new Date(borrowDate);
    d.setMonth(d.getMonth() + 1);
    // 处理月底日期问题
    const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    if (d.getDate() > lastDayOfMonth) {
        d.setDate(lastDayOfMonth);
    }
    return formatDate(d);
}

// 辅助函数：计算每期还款额（等额本息）
function calculateMonthlyPayment(principal, rate, terms) {
    if (!principal || terms <= 0) return 0;
    
    // 如果没有利率，简单平均分期
    if (!rate || rate <= 0) {
        return parseFloat((principal / terms).toFixed(2));
    }
    
    // 等额本息计算公式
    const monthlyRate = rate / 100 / 12;
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, terms) / (Math.pow(1 + monthlyRate, terms) - 1);
    return parseFloat(payment.toFixed(2)); // 四舍五入到分
}

// 辅助函数：检查是否为今天或未来几天内的日期
function isUpcoming(date, days = 3) {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(targetDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && targetDate >= today;
}

// 辅助函数：检查是否逾期
function isOverdue(date) {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate < today;
}

// 本月借下月还款功能
// 添加本月借下月还款
function addNextMonthLoan(platform, amount, borrowDate, repayDate, rate, minRate, remarks = '') {
    // 参数验证
    if (!platform || platform.trim() === '') {
        throw new Error('借款平台不能为空');
    }
    
    // 确保金额精确到分
const amountValue = parseFloat(Math.abs(parseFloat(amount)).toFixed(2));
    if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('借款金额必须是大于0的数字');
    }
    
    if (!borrowDate || !isValidDate(borrowDate)) {
        throw new Error('借款日期无效');
    }
    
    if (!repayDate || !isValidDate(repayDate)) {
        throw new Error('还款日期无效');
    }
    
    // 确保利率精确到万分之四
const rateValue = parseFloat(Math.abs(parseFloat(rate)).toFixed(4));
    if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
        throw new Error('年利率必须是0-100之间的数字');
    }
    
    // 确保最低还款比例精确到万分之四（将百分比转换为小数）
const minRateValue = parseFloat(Math.abs(parseFloat(minRate) / 100).toFixed(4));
    if (isNaN(minRateValue) || minRateValue < 0.05 || minRateValue > 0.3) {
        throw new Error('最低还款比例必须是5-30之间的数字');
    }
    
    const newLoan = {
        id: Date.now().toString(),
        platform,
        amount: amountValue,
        borrowDate,
        repayDate: repayDate || calculateRepayDate(borrowDate),
        status: 'unpaid',
        rate: rateValue,
        minPaymentRate: minRateValue,
        remarks,
        createdAt: new Date().toISOString()
    };
    
    debtData.nextMonthLoans.push(newLoan);
    saveData(debtData);
    renderNextMonthLoans();
    updateSummary();
    updateCharts();
    return newLoan;
}

// 编辑本月借下月还款
function editNextMonthLoan(id, updates) {
    const loanIndex = debtData.nextMonthLoans.findIndex(loan => loan.id === id);
    if (loanIndex !== -1) {
        debtData.nextMonthLoans[loanIndex] = {
            ...debtData.nextMonthLoans[loanIndex],
            ...updates,
            amount: updates.amount ? parseFloat(Math.abs(parseFloat(updates.amount)).toFixed(2)) : debtData.nextMonthLoans[loanIndex].amount,
            rate: updates.rate ? parseFloat(Math.abs(parseFloat(updates.rate)).toFixed(4)) : debtData.nextMonthLoans[loanIndex].rate,
            minPaymentRate: updates.minPaymentRate ? parseFloat(Math.abs(parseFloat(updates.minPaymentRate) / 100).toFixed(4)) : debtData.nextMonthLoans[loanIndex].minPaymentRate
        };
        saveData(debtData);
        renderNextMonthLoans();
        updateSummary();
        updateCharts();
    }
}

// 删除本月借下月还款
function deleteNextMonthLoan(id) {
    debtData.nextMonthLoans = debtData.nextMonthLoans.filter(loan => loan.id !== id);
    saveData(debtData);
    renderNextMonthLoans();
    updateSummary();
    updateCharts();
}

// 标记本月借下月还款为已还
function markNextMonthLoanAsPaid(id) {
    const loanIndex = debtData.nextMonthLoans.findIndex(loan => loan.id === id);
    if (loanIndex !== -1) {
        const loan = debtData.nextMonthLoans[loanIndex];
        loan.status = 'paid';
        saveData(debtData);
        renderNextMonthLoans();
        updateSummary();
        updateCharts();
        // 添加还款记录
        addPaymentRecord(id, 'nextMonth', loan.amount, 'full', '全额还款');
    }
}

// 处理最低还款
function processMinimumPayment(id, amount) {
    const loanIndex = debtData.nextMonthLoans.findIndex(loan => loan.id === id);
    if (loanIndex !== -1) {
        const loan = debtData.nextMonthLoans[loanIndex];
        
        // 确保还款金额不小于最低还款额
        // 使用贷款特定的最低还款比例，如果没有则使用全局设置
        const minPaymentRate = loan.minPaymentRate || debtData.minPaymentRate;
        const minPayment = Math.max(10, Math.ceil(loan.amount * minPaymentRate)); // 最低10元
        if (amount < minPayment) {
            alert(`最低还款额为 ¥${minPayment}`);
            return false;
        }
        
        // 计算剩余未还金额
        const remainingAmount = loan.amount - amount;
        
        // 如果是第一次部分还款
        if (loan.status !== 'partial') {
            loan.status = 'partial';
            loan.partialAmount = 0;
            loan.lastPaymentDate = new Date().toISOString();
        } else {
            // 计算上次还款到现在的利息
            const lastPaymentDate = new Date(loan.lastPaymentDate);
            const today = new Date();
            const days = Math.ceil((today - lastPaymentDate) / (24 * 60 * 60 * 1000));
            
            // 使用贷款特定的利率，如果没有则使用0
            const rate = loan.rate || 0;
            if (rate > 0 && days > 0) {
                const interest = calculateInterest(remainingAmount, rate / 100, days);
                loan.amount = parseFloat((loan.amount + interest).toFixed(2)); // 确保金额精确到分
                console.log(`计算利息: ${interest}, 剩余本金: ${remainingAmount}, 天数: ${days}, 利率: ${rate}%`);
            }
            loan.lastPaymentDate = new Date().toISOString();
        }
        
        // 更新部分还款金额
        loan.partialAmount += amount;
        
        // 如果全部还清
        if (loan.partialAmount >= loan.amount) {
            loan.status = 'paid';
            loan.partialAmount = loan.amount;
            saveData(debtData);
            renderNextMonthLoans();
            updateSummary();
            updateCharts();
            addPaymentRecord(id, 'nextMonth', loan.amount, 'full', '全额还款');
            return true;
        }
        
        saveData(debtData);
        renderNextMonthLoans();
        updateSummary();
        updateCharts();
        
        // 添加还款记录
        const paymentType = amount === minPayment ? 'minimum' : 'custom';
        addPaymentRecord(id, 'nextMonth', amount, paymentType, paymentType === 'minimum' ? '最低还款' : '自定义还款');
        
        // 计算利息并生成新的借款记录（下个月）
        const today = new Date();
        const repayDate = new Date();
        repayDate.setMonth(today.getMonth() + 1);
        
        // 计算利息天数（假设30天）
        const rate = loan.rate || 18; // 使用贷款特定的利率，如果没有则使用18%
        const interest = calculateInterest(remainingAmount, rate / 100, 30);
        const newAmount = parseFloat((remainingAmount + interest).toFixed(2)); // 确保新借款金额精确到分
        
        // 创建新的借款记录
        const newLoan = {
            id: Date.now().toString(),
            platform: loan.platform,
            amount: newAmount,
            borrowDate: formatDate(today),
            repayDate: formatDate(repayDate),
            status: 'unpaid',
            remarks: `上月未还金额产生利息: ¥${interest.toFixed(2)}`,
            createdAt: new Date().toISOString()
        };
        
        debtData.nextMonthLoans.push(newLoan);
        saveData(debtData);
        renderNextMonthLoans();
        
        return true;
    }
    return false;
}

// 展开状态变量
let nextMonthListExpanded = false;
let installmentListExpanded = false;
let paymentRecordsExpanded = false;

// 设置最低还款比例
function setMinPaymentRate(rate) {
    rate = Math.abs(parseFloat(rate));
    if (isNaN(rate) || rate < 0.05 || rate > 0.3) {
        alert('最低还款比例必须在5%-30%之间');
        return false;
    }
    debtData.minPaymentRate = rate;
    saveData(debtData);
    document.getElementById('minPaymentRate').value = rate;
    document.getElementById('minPaymentRateValue').textContent = `${(rate * 100).toFixed(0)}%`;
    return true;
}

// 获取最低还款额
function getMinimumPayment(amount) {
    return Math.max(10, Math.ceil(amount * debtData.minPaymentRate)); // 最低10元
}

// 计算利息
function calculateInterest(principal, rate, days) {
    // 简单利息计算: 本金 * 日利率 * 天数
    const dailyRate = rate / 365;
    return parseFloat((principal * dailyRate * days).toFixed(2)); // 确保利息精确到分
}

// 添加还款记录
function addPaymentRecord(loanId, loanType, amount, paymentType, remarks = '') {
    const record = {
        id: Date.now().toString(),
        loanId,
        loanType,
        amount,
        paymentType,
        date: formatDate(new Date()),
        remarks,
        createdAt: new Date().toISOString()
    };
    debtData.paymentRecords.push(record);
    saveData(debtData);
    renderPaymentRecords();
    return record;
}

// 切换还款记录列表展开/折叠
function togglePaymentRecords() {
    paymentRecordsExpanded = !paymentRecordsExpanded;
    renderPaymentRecords();
}

// 渲染还款记录表
function renderPaymentRecords() {
    const listElement = document.getElementById('paymentRecordsList');
    let records = [...debtData.paymentRecords];
    
    // 按日期倒序排序
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (records.length === 0) {
        listElement.innerHTML = `
            <tr class="text-center">
                <td colspan="6" class="px-6 py-10 text-gray-500">暂无还款记录</td>
            </tr>
        `;
        return;
    }
    
    // 处理3行限制
    const showAll = paymentRecordsExpanded || records.length <= 3;
    const displayRecords = showAll ? records : records.slice(0, 3);
    
    let html = displayRecords.map(record => {
        // 查找关联的借款
        let loanInfo = '未知借款';
        let loanPlatform = '未知平台';
        
        if (record.loanType === 'nextMonth') {
            const loan = debtData.nextMonthLoans.find(l => l.id === record.loanId);
            if (loan) {
                loanInfo = `¥${formatAmount(loan.amount)}`;
                loanPlatform = loan.platform;
            }
        } else if (record.loanType === 'installment') {
            const loan = debtData.installmentLoans.find(l => l.id === record.loanId);
            if (loan) {
                loanInfo = `¥${formatAmount(loan.amount)}`;
                loanPlatform = loan.platform;
            }
        }
        
        const paymentTypeText = record.paymentType === 'full' ? '全额还款' : 
                               (record.paymentType === 'minimum' ? '最低还款' : '自定义还款');
        const paymentTypeClass = record.paymentType === 'full' ? 'text-success' : 
                                (record.paymentType === 'minimum' ? 'text-warning' : 'text-primary');
        
        return `
            <tr class="hover:bg-gray-50 transition-custom">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${record.date}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${loanPlatform}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${loanInfo}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-primary">¥${formatAmount(record.amount)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentTypeClass}">
                        ${paymentTypeText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>${record.remarks || '-'}</div>
                </td>
            </tr>
        `;
    }).join('');
    
    // 添加展开/折叠按钮
    if (records.length > 3) {
        html += `
            <tr class="text-center bg-gray-50">
                <td colspan="7" class="px-6 py-3">
                    <button onclick="togglePaymentRecords()" class="text-primary hover:text-primary/80 font-medium">
                        ${paymentRecordsExpanded ? '收起' : `显示更多 (${records.length - 3})`}
                    </button>
                </td>
            </tr>
        `;
    }
    
    listElement.innerHTML = html;
}

// 切换本月借下月还款列表展开/折叠
function toggleNextMonthList() {
    nextMonthListExpanded = !nextMonthListExpanded;
    renderNextMonthLoans();
}

// 切换分期还款列表展开/折叠
function toggleInstallmentList() {
    installmentListExpanded = !installmentListExpanded;
    renderInstallmentLoans();
}

// 渲染本月借下月还款列表
function renderNextMonthLoans() {
    const listElement = document.getElementById('nextMonthList');
    let loans = [...debtData.nextMonthLoans];
    
    // 筛选掉已还清的借款
    loans = loans.filter(loan => loan.status !== 'paid');
    
    // 排序处理
    const sortBy = document.getElementById('nextMonthSort').value;
    switch (sortBy) {
        case 'platform':
            loans.sort((a, b) => a.platform.localeCompare(b.platform));
            break;
        case 'amount':
            loans.sort((a, b) => b.amount - a.amount);
            break;
        case 'status':
            loans.sort((a, b) => {
                const statusOrder = { 'unpaid': 0, 'partial': 1, 'paid': 2 };
                return statusOrder[a.status] - statusOrder[b.status];
            });
            break;
        case 'date':
        default:
            loans.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
            break;
    }
    
    if (loans.length === 0) {
        listElement.innerHTML = `
            <tr class="text-center">
                <td colspan="6" class="px-6 py-10 text-gray-500">暂无借款记录</td>
            </tr>
        `;
        return;
    }
    
    // 处理10行限制
    const showAll = nextMonthListExpanded || loans.length <= 10;
    const displayLoans = showAll ? loans : loans.slice(0, 10);
    
    let html = displayLoans.map(loan => {
        const isUpcomingPayment = isUpcoming(loan.repayDate, 3);
        const isOverduePayment = isOverdue(loan.repayDate);
        const statusClass = loan.status === 'paid' ? 'text-success' : 
                          (loan.status === 'partial' ? 'text-warning' : 'text-danger');
        const statusText = loan.status === 'paid' ? '已还' : 
                          (loan.status === 'partial' ? '部分还款' : '未还');
        const dateClass = isOverduePayment ? 'text-danger font-semibold' : 
                         (isUpcomingPayment ? 'text-warning font-semibold' : '');
        
        return `
            <tr class="hover:bg-gray-50 transition-custom">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${loan.platform}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">¥${formatAmount(loan.amount)}</div>
                    ${loan.status === 'partial' ? `<div class="text-xs text-gray-500">已还 ¥${formatAmount(loan.partialAmount)}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${loan.borrowDate}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm ${dateClass}">${loan.repayDate}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${(loan.minPaymentRate * 100).toFixed(0)}%</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex space-x-2">
                        ${loan.status === 'unpaid' ? `
                            <button onclick="markNextMonthLoanAsPaid('${loan.id}')" class="text-success hover:text-success/80" title="标记为已还">
                                <i class="fa fa-check" aria-hidden="true"></i>
                            </button>
                            <button onclick="showMinimumPaymentModal('${loan.id}')" class="text-warning hover:text-warning/80" title="最低还款">
                                <i class="fa fa-credit-card" aria-hidden="true"></i>
                            </button>
                        ` : ''}
                        <button onclick="editNextMonthLoanModal('${loan.id}')" class="text-primary hover:text-primary/80" title="编辑">
                            <i class="fa fa-pencil" aria-hidden="true"></i>
                        </button>
                        <button onclick="deleteNextMonthLoanConfirm('${loan.id}')" class="text-danger hover:text-danger/80" title="删除">
                            <i class="fa fa-trash" aria-hidden="true"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // 添加展开/折叠按钮
    if (loans.length > 10) {
        html += `
            <tr class="text-center bg-gray-50">
                <td colspan="7" class="px-6 py-3">
                    <button onclick="toggleNextMonthList()" class="text-primary hover:text-primary/80 font-medium">
                        ${nextMonthListExpanded ? '收起' : `显示更多 (${loans.length - 10})`}
                    </button>
                </td>
            </tr>
        `;
    }
    
    listElement.innerHTML = html;
}

// 分期还款功能

// 添加分期还款
function addInstallmentLoan(platform, amount, terms, rate, monthlyPayment, borrowDate, nextRepayDate, remarks = '') {
    // 确保本金精确到分
const principal = parseFloat(Math.abs(parseFloat(amount)).toFixed(2));
    const termCount = Math.abs(parseInt(terms));
    const rateValue = Math.abs(parseFloat(rate)) || 0;
    // 确保每月还款额精确到分
const payment = parseFloat((Math.abs(parseFloat(monthlyPayment)) || calculateMonthlyPayment(principal, rateValue, termCount)).toFixed(2));
    
    // 验证期数
    if (isNaN(termCount) || termCount <= 0) {
        throw new Error('分期期数必须是大于0的整数');
    }
    
    // 初始化分期数组
    const installments = [];
    const today = new Date();
    
    for (let i = 1; i <= termCount; i++) {
        // 计算每期的还款日
        let currentDate;
        
        if (i === 1) {
            // 第一期使用首次还款日期
            currentDate = nextRepayDate ? new Date(nextRepayDate) : new Date(borrowDate);
        } else {
            // 从第一期的日期开始计算
            currentDate = new Date(installments[0].date);
            currentDate.setMonth(currentDate.getMonth() + (i - 1));
        }
        
        // 格式化日期
        const formattedDate = formatDate(currentDate);
        
        // 检查是否已还款（根据当前日期）
        let status = 'unpaid';
        if (currentDate < today) {
            // 如果分期日期已过，设置为已还
            status = 'paid';
        }
        
        installments.push({
            id: `${Date.now()}-${i}`,
            term: i,
            date: formattedDate,
            amount: payment,
            status: status
        });
    }
    
    const newLoan = {
        id: Date.now().toString(),
        platform,
        amount: principal,
        terms: termCount,
        rate: rateValue,
        monthlyPayment: payment,
        borrowDate,
        nextRepayDate: installments.find(inst => inst.status === 'unpaid')?.date || '',
        installments,
        remarks,
        createdAt: new Date().toISOString()
    };
    
    debtData.installmentLoans.push(newLoan);
    saveData(debtData);
    renderInstallmentLoans();
    updateSummary();
    updateCharts();
    return newLoan;
}

// 编辑分期还款
function editInstallmentLoan(id, updates) {
    const loanIndex = debtData.installmentLoans.findIndex(loan => loan.id === id);
    if (loanIndex !== -1) {
        const currentLoan = debtData.installmentLoans[loanIndex];
        
        // 更新基本信息
        const updatedLoan = {
            ...currentLoan,
            ...updates,
            amount: updates.amount ? parseFloat(Math.abs(parseFloat(updates.amount)).toFixed(2)) : currentLoan.amount,
            terms: updates.terms ? Math.abs(parseInt(updates.terms)) : currentLoan.terms,
            rate: updates.rate ? Math.abs(parseFloat(updates.rate)) : currentLoan.rate,
            monthlyPayment: updates.monthlyPayment ? parseFloat(Math.abs(parseFloat(updates.monthlyPayment)).toFixed(2)) : currentLoan.monthlyPayment
        };
        
        // 如果修改了影响分期的参数，重新计算分期
        if (updates.amount || updates.terms || updates.rate || updates.monthlyPayment) {
            const installments = [];
            const paidTerms = currentLoan.installments.filter(inst => inst.status === 'paid').length;
            
            for (let i = 1; i <= updatedLoan.terms; i++) {
                // 保持已还款的状态
                const existingInstallment = currentLoan.installments.find(inst => inst.term === i);     
                
                if (existingInstallment && existingInstallment.status === 'paid') {
                    installments.push(existingInstallment);
                } else {
                    // 计算新的还款日期
                    const date = i <= paidTerms ? 
                                (existingInstallment ? existingInstallment.date : '') :
                                (i === paidTerms + 1 && updates.nextRepayDate ? 
                                    updates.nextRepayDate : 
                                    calculateRepayDate(currentLoan.installments[i-2]?.date || currentLoan.borrowDate));
                    
                    installments.push({
                        id: `${Date.now()}-${i}`,
                        term: i,
                        date,
                        amount: updatedLoan.monthlyPayment,
                        status: i <= paidTerms ? 'paid' : 'unpaid'
                    });
                }
            }
            
            updatedLoan.installments = installments;
            // 更新下一期还款日为第一个未还分期的日期
    updatedLoan.nextRepayDate = installments.find(inst => inst.status === 'unpaid')?.date || '';
        }
        
        debtData.installmentLoans[loanIndex] = updatedLoan;
        saveData(debtData);
        renderInstallmentLoans();
        updateSummary();
        updateCharts();
    }
}

// 删除分期还款
function deleteInstallmentLoan(id) {
    debtData.installmentLoans = debtData.installmentLoans.filter(loan => loan.id !== id);
    saveData(debtData);
    renderInstallmentLoans();
    updateSummary();
    updateCharts();
}

// 标记分期还款为已还款
function markInstallmentAsPaid(loanId, termId) {
    const loanIndex = debtData.installmentLoans.findIndex(loan => loan.id === loanId);
    if (loanIndex !== -1) {
        const installmentIndex = debtData.installmentLoans[loanIndex].installments.findIndex(inst => inst.id === termId);
        if (installmentIndex !== -1) {
            debtData.installmentLoans[loanIndex].installments[installmentIndex].status = 'paid';
            
            // 检查是否所有期数都已还清
            const allPaid = debtData.installmentLoans[loanIndex].installments.every(inst => inst.status === 'paid');
            
            // 更新下一期还款日
            const nextUnpaid = debtData.installmentLoans[loanIndex].installments.find(inst => inst.status === 'unpaid');
            debtData.installmentLoans[loanIndex].nextRepayDate = nextUnpaid ? nextUnpaid.date : '';
            
            saveData(debtData);
            renderInstallmentLoans();
            updateSummary();
            updateCharts();
            
            // 如果所有期数都已还清，添加全额还款记录
            if (allPaid) {
                const totalAmount = debtData.installmentLoans[loanIndex].installments.reduce((sum, inst) => sum + inst.amount, 0);
                addPaymentRecord(loanId, 'installment', totalAmount, 'full', '分期全额还款');
            }
        }
    }
}

// 计算分期剩余还款金额
function getInstallmentRemainingAmount(loan) {
    return loan.installments
        .filter(inst => inst.status === 'unpaid')
        .reduce((sum, inst) => sum + inst.amount, 0);
}

// 渲染分期还款列表
function renderInstallmentLoans() {
    const listElement = document.getElementById('installmentList');
    let loans = [...debtData.installmentLoans];
    
    // 筛选掉所有期数都已还清的借款
    loans = loans.filter(loan => !loan.installments.every(inst => inst.status === 'paid'));
    
    // 排序处理
    const sortBy = document.getElementById('installmentSort').value;
    switch (sortBy) {
        case 'platform':
            loans.sort((a, b) => a.platform.localeCompare(b.platform));
            break;
        case 'amount':
            loans.sort((a, b) => b.amount - a.amount);
            break;
        case 'remainingTerms':
            loans.sort((a, b) => {
                const aRemaining = a.installments.filter(inst => inst.status === 'unpaid').length;
                const bRemaining = b.installments.filter(inst => inst.status === 'unpaid').length;
                return aRemaining - bRemaining;
            });
            break;
        case 'date':
        default:
            loans.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
            break;
    }
    
    if (loans.length === 0) {
        listElement.innerHTML = `
            <tr class="text-center">
                <td colspan="6" class="px-6 py-10 text-gray-500">暂无分期借款记录</td>
            </tr>
        `;
        return;
    }
    
    // 处理10行限制
    const showAll = installmentListExpanded || loans.length <= 10;
    const displayLoans = showAll ? loans : loans.slice(0, 10);
    
    let html = displayLoans.map(loan => {
        const remainingTerms = loan.installments.filter(inst => inst.status === 'unpaid').length;
        const paidTerms = loan.terms - remainingTerms;
        const isNextPaymentUpcoming = loan.nextRepayDate && isUpcoming(loan.nextRepayDate, 3);
        const isNextPaymentOverdue = loan.nextRepayDate && isOverdue(loan.nextRepayDate);
        const dateClass = isNextPaymentOverdue ? 'text-danger font-semibold' : 
                         (isNextPaymentUpcoming ? 'text-warning font-semibold' : 'text-gray-900');
        
        return `
            <tr class="hover:bg-gray-50 transition-custom">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${loan.platform}</div>
                    ${loan.nextRepayDate ? `<div class="text-xs ${dateClass}">下一还款日 ${loan.nextRepayDate}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">¥${formatAmount(loan.amount)}</div>
                    ${loan.rate > 0 ? `<div class="text-xs text-gray-500">年利率 ${loan.rate}%</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${loan.terms} 期</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-warning">¥${formatAmount(getInstallmentRemainingAmount(loan))}</div>
                    <div class="text-xs text-gray-500">剩余还款</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">¥${formatAmount(loan.monthlyPayment)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${remainingTerms} 期</div>
                    <div class="text-xs text-gray-500">已还 ${paidTerms} 期</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex space-x-2">
                        <button onclick="showInstallmentDetails('${loan.id}')" class="text-info hover:text-info/80" title="查看详情">
                            <i class="fa fa-list" aria-hidden="true"></i>
                        </button>
                        <button onclick="editInstallmentLoanModal('${loan.id}')" class="text-primary hover:text-primary/80" title="编辑">
                            <i class="fa fa-pencil" aria-hidden="true"></i>
                        </button>
                        <button onclick="deleteInstallmentLoanConfirm('${loan.id}')" class="text-danger hover:text-danger/80" title="删除">
                            <i class="fa fa-trash" aria-hidden="true"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // 添加展开/折叠按钮
    if (loans.length > 10) {
        html += `
            <tr class="text-center bg-gray-50">
                <td colspan="7" class="px-6 py-3">
                    <button onclick="toggleInstallmentList()" class="text-primary hover:text-primary/80 font-medium">
                        ${installmentListExpanded ? '收起' : `显示更多 (${loans.length - 10})`}
                    </button>
                </td>
            </tr>
        `;
    }
    
    listElement.innerHTML = html;
}

// 显示分期详情
function showInstallmentDetails(loanId) {
    const loan = debtData.installmentLoans.find(l => l.id === loanId);
    if (!loan) return;
    
    const modal = document.getElementById('installmentDetailModal');
    const modalTitle = document.getElementById('detailModalTitle');
    const modalContent = document.getElementById('installmentDetailContent');
    
    modalTitle.textContent = `${loan.platform} - 分期还款详情`;
    
    // 计算统计信息
    const paidAmount = loan.installments
        .filter(inst => inst.status === 'paid')
        .reduce((sum, inst) => sum + inst.amount, 0);
    const remainingAmount = loan.installments
        .filter(inst => inst.status === 'unpaid')
        .reduce((sum, inst) => sum + inst.amount, 0);
    const totalAmount = paidAmount + remainingAmount;
    
    // 生成分期详情表格
    modalContent.innerHTML = `
        <div class="mb-6">
            <div class="flex flex-wrap justify-between gap-4">
                <div>
                    <p class="text-gray-500 text-sm">平台</p>
                    <p class="font-medium">${loan.platform}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">总借款额</p>
                    <p class="font-medium">¥${formatAmount(loan.amount)}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">分期期数</p>
                      <p class="font-medium">${loan.terms} 期</p>
                </div>
                ${loan.rate > 0 ? `
                    <div>
                        <p class="text-gray-500 text-sm">年利率</p>
                        <p class="font-medium">${loan.rate}%</p>
                    </div>
                ` : ''}
            </div>
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-purple-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-500">已还金额</p>
                    <p class="text-lg font-semibold text-success">¥${formatAmount(paidAmount)}</p>
                </div>
                <div class="bg-yellow-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-500">待还金额</p>
                    <p class="text-lg font-semibold text-warning">¥${formatAmount(remainingAmount)}</p>
                </div>
                <div class="bg-blue-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-500">总还款额</p>
                    <p class="text-lg font-semibold text-primary">¥${formatAmount(totalAmount)}</p>
                </div>
            </div>
        </div>
        
        <h4 class="font-semibold mb-3">还款计划</h4>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期数</th>
                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">还款日期</th>
                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">还款金额</th>
                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${loan.installments.map(inst => {
                        const isUpcomingPayment = isUpcoming(inst.date, 3);
                        const isOverduePayment = isOverdue(inst.date);
                        const statusClass = inst.status === 'paid' ? 'bg-success/10 text-success' : 
                                          (isOverduePayment ? 'bg-danger/10 text-danger' : 
                                          (isUpcomingPayment ? 'bg-warning/10 text-warning' : 'bg-gray-100 text-gray-900'));
                        const statusText = inst.status === 'paid' ? '已还' : '未还';
                        const dateClass = isOverduePayment ? 'text-danger font-semibold' : 
                                         (isUpcomingPayment ? 'text-warning font-semibold' : '');
                        
                        return `
                            <tr>
                                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">第${inst.term}期</td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm ${dateClass}">${inst.date}</td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">¥${formatAmount(inst.amount)}</td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                        ${statusText}
                                    </span>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    ${inst.status === 'unpaid' ? `
                                        <button onclick="markInstallmentAsPaid('${loan.id}', '${inst.id}')" class="text-success hover:text-success/80" title="标记为已还">
                                            <i class="fa fa-check" aria-hidden="true"></i>
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// 汇总信息更新函数
function updateSummary() {
    // 本月借下月还款统计
    const nextMonthTotalAmount = debtData.nextMonthLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const nextMonthPaidAmount = debtData.nextMonthLoans
        .filter(loan => loan.status === 'paid')
        .reduce((sum, loan) => sum + loan.amount, 0);
    const nextMonthPartialAmount = debtData.nextMonthLoans
        .filter(loan => loan.status === 'partial' && loan.partialAmount)
        .reduce((sum, loan) => sum + loan.partialAmount, 0);
    const nextMonthRemainingAmount = nextMonthTotalAmount - nextMonthPaidAmount - nextMonthPartialAmount;
    
    // 分期还款统计
    const installmentTotalAmount = debtData.installmentLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const installmentPaidTerms = debtData.installmentLoans
        .flatMap(loan => loan.installments)
        .filter(inst => inst.status === 'paid')
        .length;
    const installmentRemainingTerms = debtData.installmentLoans
        .flatMap(loan => loan.installments)
        .filter(inst => inst.status === 'unpaid')
        .length;
    const installmentRemainingAmount = debtData.installmentLoans
        .flatMap(loan => loan.installments)
        .filter(inst => inst.status === 'unpaid')
        .reduce((sum, inst) => sum + inst.amount, 0);
        
        // 更新本月借下月还款汇总
    document.getElementById('nextMonthTotalAmount').textContent = `¥${formatAmount(nextMonthTotalAmount)}`;
    document.getElementById('nextMonthPaidAmount').textContent = `¥${formatAmount(nextMonthPaidAmount + nextMonthPartialAmount)}`;
    document.getElementById('nextMonthRemainingAmount').textContent = `¥${formatAmount(nextMonthRemainingAmount)}`;
    
    // 更新分期还款汇总
    document.getElementById('installmentTotalAmount').textContent = `¥${formatAmount(installmentTotalAmount)}`;
    document.getElementById('installmentPaidTerms').textContent = installmentPaidTerms;
    document.getElementById('installmentRemainingTerms').textContent = installmentRemainingTerms;
    
    // 更新顶部汇总栏
    document.getElementById('nextMonthTotal').textContent = `¥${formatAmount(nextMonthRemainingAmount)}`;
    document.getElementById('installmentTotal').textContent = `¥${formatAmount(installmentRemainingAmount)}`;
    document.getElementById('grandTotal').textContent = `¥${formatAmount(nextMonthRemainingAmount + installmentRemainingAmount)}`;
    
    // 检查还款提醒
    checkReminders();
}

// 检查还款提醒
function checkReminders() {
    const reminderBanner = document.getElementById('reminderBanner');
    const reminderText = document.getElementById('reminderText');
    
    let upcomingCount = 0;
    let overdueCount = 0;
    
    // 检查本月借下月还款
    debtData.nextMonthLoans.forEach(loan => {
        if (loan.status === 'unpaid') {
            if (isOverdue(loan.repayDate)) {
                overdueCount++;
            } else if (isUpcoming(loan.repayDate)) {
                upcomingCount++;
            }
        }
    });
    
    // 检查分期还款
    debtData.installmentLoans.forEach(loan => {
        const nextUnpaid = loan.installments.find(inst => inst.status === 'unpaid');
        if (nextUnpaid) {
            if (isOverdue(nextUnpaid.date)) {
                overdueCount++;
            } else if (isUpcoming(nextUnpaid.date)) {
                upcomingCount++;
            }
        }
    });
    
    // 显示提醒
    if (overdueCount > 0) {
        reminderBanner.classList.remove('hidden');
        reminderText.textContent = `您有 ${overdueCount} 笔借款已逾期，请尽快还款！`;
        reminderBanner.classList.remove('bg-warning/10', 'border-warning/30');
        reminderBanner.classList.add('bg-danger/10', 'border-danger/30');
        reminderText.classList.remove('text-warning');
        reminderText.classList.add('text-danger');
    } else if (upcomingCount > 0) {
        reminderBanner.classList.remove('hidden');
        reminderText.textContent = `您有 ${upcomingCount} 笔借款将在3天内到期，请提前做好还款准备。`;
        reminderBanner.classList.remove('bg-danger/10', 'border-danger/30');
        reminderBanner.classList.add('bg-warning/10', 'border-warning/30');
        reminderText.classList.remove('text-danger');
        reminderText.classList.add('text-warning');
    } else {
        reminderBanner.classList.add('hidden');
    }
}

// 图表功能
let debtCompositionChart, futurePaymentsChart;

function updateCharts() {
    updateDebtCompositionChart();
    updateFuturePaymentsChart();
}

function updateDebtCompositionChart() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded. Skipping chart rendering.');
        return;
    }
    
    const ctx = document.getElementById('debtCompositionChart').getContext('2d');
    
    // 计算债务构成数据
    const nextMonthAmount = debtData.nextMonthLoans
        .filter(loan => loan.status === 'unpaid' || loan.status === 'partial')
        .reduce((sum, loan) => {
            if (loan.status === 'partial' && loan.partialAmount) {
                return sum + (loan.amount - loan.partialAmount);
            }
            return sum + loan.amount;
        }, 0);
    
    const installmentAmount = debtData.installmentLoans
        .flatMap(loan => loan.installments)
        .filter(inst => inst.status === 'unpaid')
        .reduce((sum, inst) => sum + inst.amount, 0);
    
    const data = {
        labels: ['本月借下月还', '分期还款'],
        datasets: [{
            data: [nextMonthAmount, installmentAmount],
            backgroundColor: ['#3B82F6', '#6366F1'],
            borderColor: ['#2563EB', '#4F46E5'],
            borderWidth: 1
        }]
    };
    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ¥${formatAmount(value)} (${percentage}%)`;
                    }
                }
            }
        }
    };
    
    if (debtCompositionChart) {
        debtCompositionChart.destroy();
    }
    
    debtCompositionChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });
}

function updateFuturePaymentsChart() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded. Skipping chart rendering.');
        return;
    }
    
    const ctx = document.getElementById('futurePaymentsChart').getContext('2d');
    
    // 准备未来还款数据收集未来三个月的还款数据
    const today = new Date();
    const futureData = {};
    
    // 生成未来三个月的月份标签
    const monthLabels = [];
    for (let i = 0; i < 3; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        monthLabels.push(date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }));
        futureData[monthLabels[i]] = { nextMonth: 0, installment: 0 };
    }
    
    // 处理本月借下月还款
    debtData.nextMonthLoans.forEach(loan => {
        if (loan.status === 'unpaid' || loan.status === 'partial') {
            const repayDate = new Date(loan.repayDate);
            const monthKey = repayDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
            
            if (monthLabels.includes(monthKey)) {
                let amount = loan.amount;
                if (loan.status === 'partial' && loan.partialAmount) {
                    amount -= loan.partialAmount;
                }
                futureData[monthKey].nextMonth += amount;
            }
        }
    });
    
    // 处理分期还款
    debtData.installmentLoans.forEach(loan => {
        loan.installments.forEach(inst => {
            if (inst.status === 'unpaid') {
                const repayDate = new Date(inst.date);
                const monthKey = repayDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
                
                if (monthLabels.includes(monthKey)) {
                    futureData[monthKey].installment += inst.amount;
                }
            }
        });
    });
    
    // 准备图表数据
    const data = {
        labels: monthLabels,
        datasets: [
            {
                label: '本月借下月还',
                data: monthLabels.map(month => futureData[month].nextMonth),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: '#3B82F6',
                borderWidth: 1
            },
            {
                label: '分期还款',
                data: monthLabels.map(month => futureData[month].installment),
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: '#6366F1',
                borderWidth: 1
            }
        ]
    };
    
    const options = {
        responsive: true,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '¥' + formatAmount(value);
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'bottom'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y || 0;
                        return `${label}: ¥${formatAmount(value)}`;
                    }
                }
            }
        }
    };
    
    if (futurePaymentsChart) {
        futurePaymentsChart.destroy();
    }
    
    futurePaymentsChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });
}

// 数据导入导出功能

// 导出数据
function exportData() {
    const dataStr = JSON.stringify(debtData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `debt_records_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// 导入数据
function importData(file) {
    console.log('开始导入数据:', file);
    
    // 检查文件类型
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('请选择JSON格式的文件');
        return;
    }
    
    // 检查文件大小
    if (file.size > 5 * 1024 * 1024) { // 5MB限制
        alert('文件大小超过5MB,请选择更小的文件');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            console.log('文件读取完成，开始解析数据');
            const importedData = JSON.parse(event.target.result);
            
            // 验证数据格式
            if (!importedData || typeof importedData !== 'object') {
                throw new Error('无效的数据结构');
            }
            
            if (!Array.isArray(importedData.nextMonthLoans)) {
                throw new Error('数据缺少nextMonthLoans数组');
            }
            
            if (!Array.isArray(importedData.installmentLoans)) {
                throw new Error('数据缺少installmentLoans数组');
            }
            
            // 可选字段验证
            if (importedData.platforms && !Array.isArray(importedData.platforms)) {
                throw new Error('platforms字段必须是数组');
            }
            
            debtData = importedData;
            // 确保platforms字段存在
            if (!debtData.platforms) {
                debtData.platforms = ['花呗', '信用卡', '美团月付', '美团借钱', '放心借', '借呗', '其他'];
            }
            
            console.log('数据验证通过，准备保存');
            saveData(debtData);
            
            // 重新渲染所有内容
            renderNextMonthLoans();
            renderInstallmentLoans();
            updateSummary();
            updateCharts();
            updatePlatformDropdowns();
            
            console.log('数据导入成功');
            alert('数据导入成功');
        } catch (error) {
            console.error('数据导入失败:', error);
            alert('数据解析失败: ' + error.message);
        }
    };
    
    reader.onerror = function() {
        console.error('文件读取失败');
        alert('文件读取失败，请尝试其他文件');
    };
    
    reader.readAsText(file);
}

// 重置数据 - 二次确认
function resetData() {
    console.log('进入resetData函数');
    if (confirm('确定要重置所有数据吗？\n\n此操作将删除所有借款记录，不可撤销！')) {
        console.log('用户点击了第一次确认');
        if (confirm('再次确认：所有数据将被永久删除，无法恢复。\n\n确定要继续重置吗？')) {
            console.log('用户点击了第二次确认，开始重置数据');
            localStorage.removeItem(STORAGE_KEY);
            debtData = initData();
            // 重新渲染所有内容
            renderNextMonthLoans();
            renderInstallmentLoans();
            updateSummary();
            updateCharts();
            
            alert('数据已重置！');
            console.log('数据重置完成');
        } else {
            console.log('用户点击了第二次取消，不执行数据重置');
        }
    } else {
        console.log('用户点击了第一次取消，不执行数据重置');
    }
}

// 模态框功能

// 编辑本月借下月还款模态框
function editNextMonthLoanModal(id) {
    const loan = debtData.nextMonthLoans.find(l => l.id === id);
    if (!loan) return;
    
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('editModalTitle');
    const modalContent = document.getElementById('editModalContent');
    
    modalTitle.textContent = '编辑本月借下月还';
    
    // 生成编辑表单
    modalContent.innerHTML = `
        <form id="editNextMonthForm" class="space-y-4">
            <input type="hidden" name="id" value="${loan.id}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="editNextMonthPlatform" class="block text-sm font-medium text-gray-700 mb-1">借款平台</label>
                    <select id="editNextMonthPlatform" name="platform" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    </select>
                </div>
                <div>
                    <label for="editNextMonthAmount" class="block text-sm font-medium text-gray-700 mb-1">借款金额 (¥)</label>
                    <input type="number" id="editNextMonthAmount" name="amount" step="0.01" min="0.01" value="${loan.amount}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="editNextMonthRate" class="block text-sm font-medium text-gray-700 mb-1">年利率 (%)</label>
                    <input type="number" id="editNextMonthRate" name="rate" step="0.01" min="0" max="100" value="${loan.rate || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label for="editNextMonthMinRate" class="block text-sm font-medium text-gray-700 mb-1">最低还款比例 (%)</label>
                    <input type="number" id="editNextMonthMinRate" name="minPaymentRate" step="0.01" min="5" max="30" value="${loan.minPaymentRate || 10}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="editNextMonthBorrowDate" class="block text-sm font-medium text-gray-700 mb-1">借款日期</label>
                    <input type="date" id="editNextMonthBorrowDate" name="borrowDate" value="${loan.borrowDate}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label for="editNextMonthRepayDate" class="block text-sm font-medium text-gray-700 mb-1">还款日期</label>
                    <input type="date" id="editNextMonthRepayDate" name="repayDate" value="${loan.repayDate}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
            </div>
            <div>
                <label for="editNextMonthRemarks" class="block text-sm font-medium text-gray-700 mb-1">备注 (可选)</label>
                <input type="text" id="editNextMonthRemarks" name="remarks" value="${loan.remarks || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
        </form>
    `;
    
    // 设置保存按钮的点击事件
    document.getElementById('saveEdit').onclick = function() {
        const form = document.getElementById('editNextMonthForm');
        const updates = {
            platform: form.elements.platform.value,
            amount: form.elements.amount.value,
            borrowDate: form.elements.borrowDate.value,
            repayDate: form.elements.repayDate.value,
            rate: form.elements.rate.value,
            minPaymentRate: form.elements.minPaymentRate.value,
            remarks: form.elements.remarks.value
        };
        
        // 转换数值类型
        updates.amount = parseFloat(updates.amount);
        updates.rate = parseFloat(updates.rate);
        updates.minPaymentRate = parseFloat(updates.minPaymentRate);
        
        editNextMonthLoan(id, updates);
        modal.classList.add('hidden');
    };
    
    // 确保表单渲染完成后再更新下拉菜单
    setTimeout(() => {
        // 更新所有平台下拉菜单
        updatePlatformDropdowns();
        
        // 选中当前贷款的平台
        const editNextMonthPlatformSelect = document.getElementById('editNextMonthPlatform');
        if (editNextMonthPlatformSelect) {
            editNextMonthPlatformSelect.value = loan.platform;
        }
    }, 0);
    
    modal.classList.remove('hidden');
}

// 编辑分期还款模态框
function editInstallmentLoanModal(id) {
    const loan = debtData.installmentLoans.find(l => l.id === id);
    if (!loan) return;
    
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('editModalTitle');
    const modalContent = document.getElementById('editModalContent');
    
    modalTitle.textContent = '编辑分期还款';
    
    // 生成编辑表单
    modalContent.innerHTML = `
        <form id="editInstallmentForm" class="space-y-4">
            <input type="hidden" name="id" value="${loan.id}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="editInstallmentPlatform" class="block text-sm font-medium text-gray-700 mb-1">借款平台</label>
                    <select id="editInstallmentPlatform" name="platform" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                    </select>
                </div>
                <div>
                    <label for="editInstallmentAmount" class="block text-sm font-medium text-gray-700 mb-1">借款金额 (¥)</label>
                    <input type="number" id="editInstallmentAmount" name="amount" step="0.01" min="0.01" value="${loan.amount}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label for="editInstallmentTerm" class="block text-sm font-medium text-gray-700 mb-1">分期期数</label>
                    <input type="number" id="editInstallmentTerm" name="terms" min="1" max="24" value="${loan.terms}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                </div>
                <div>
                    <label for="editInstallmentRate" class="block text-sm font-medium text-gray-700 mb-1">年利率(%)</label>
                    <input type="number" id="editInstallmentRate" name="rate" step="0.01" min="0" value="${loan.rate || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                </div>
                <div>
                    <label for="editInstallmentPayment" class="block text-sm font-medium text-gray-700 mb-1">每期还款 (¥)</label>
                    <input type="number" id="editInstallmentPayment" name="monthlyPayment" step="0.01" min="0.01" value="${loan.monthlyPayment}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="editInstallmentBorrowDate" class="block text-sm font-medium text-gray-700 mb-1">借款日期</label>
                    <input type="date" id="editInstallmentBorrowDate" name="borrowDate" value="${loan.borrowDate}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                </div>
                <div>
                    <label for="editInstallmentNextRepayDate" class="block text-sm font-medium text-gray-700 mb-1">下一还款日</label>
                    <input type="date" id="editInstallmentNextRepayDate" name="nextRepayDate" value="${loan.nextRepayDate || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
                </div>
            </div>
            <div>
                <label for="editInstallmentRemarks" class="block text-sm font-medium text-gray-700 mb-1">备注 (可选)</label>
                <input type="text" id="editInstallmentRemarks" name="remarks" value="${loan.remarks || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent">
            </div>
        </form>
    `;
    
    // 设置保存按钮的点击事件
    document.getElementById('saveEdit').onclick = function() {
        const form = document.getElementById('editInstallmentForm');
        const updates = {
            platform: form.elements.platform.value,
            amount: form.elements.amount.value,
            terms: form.elements.terms.value,
            rate: form.elements.rate.value,
            monthlyPayment: form.elements.monthlyPayment.value,
            borrowDate: form.elements.borrowDate.value,
            nextRepayDate: form.elements.nextRepayDate.value,
            remarks: form.elements.remarks.value
        };
        
        editInstallmentLoan(id, updates);
        modal.classList.add('hidden');
    };
    
    // 确保表单渲染完成后再更新下拉菜单
    setTimeout(() => {
        // 更新所有平台下拉菜单
        updatePlatformDropdowns();
        
        // 选中当前贷款的平台
        const editInstallmentPlatformSelect = document.getElementById('editInstallmentPlatform');
        if (editInstallmentPlatformSelect) {
            editInstallmentPlatformSelect.value = loan.platform;
        }
    }, 0);
    
    modal.classList.remove('hidden');
}

// 最低还款模态框
function showMinimumPaymentModal(id) {
    const loan = debtData.nextMonthLoans.find(l => l.id === id);
    if (!loan) return;
    
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('editModalTitle');
    const modalContent = document.getElementById('editModalContent');
    
    modalTitle.textContent = '最低还款';
    
    // 生成最低还款表格
    modalContent.innerHTML = `
        <form id="minimumPaymentForm" class="space-y-4">
            <input type="hidden" name="id" value="${loan.id}">
            <div class="p-4 bg-blue-50 rounded-lg mb-4">
                <p class="text-sm text-gray-700 mb-2">当前借款信息</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span class="font-medium">平台</span>${loan.platform}</div>
                    <div><span class="font-medium">金额</span>¥${formatAmount(loan.amount)}</div>
                    <div><span class="font-medium">借款日期</span>${loan.borrowDate}</div>
                    <div><span class="font-medium">还款日期</span>${loan.repayDate}</div>
                </div>
            </div>
            <div>
                <label for="minimumAmount" class="block text-sm font-medium text-gray-700 mb-1">最低还款金额 (¥)</label>
                <input type="number" id="minimumAmount" name="minimumAmount" step="0.01" min="0.01" max="${loan.amount}" value="${(loan.amount * (loan.minPaymentRate || debtData.minPaymentRate)).toFixed(2)}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-warning focus:border-transparent">
                <p class="mt-1 text-xs text-gray-500">最低还款后，剩余金额将自动计算利息并转入下期账单</p>
            </div>
        </form>
    `;
    
    // 设置保存按钮的点击事件
    document.getElementById('saveEdit').onclick = function() {
        const form = document.getElementById('minimumPaymentForm');
        const minAmount = form.elements.minimumAmount.value;
        
        if (parseFloat(minAmount) > 0 && parseFloat(minAmount) <= loan.amount) {
            processMinimumPayment(id, minAmount);
            modal.classList.add('hidden');
        } else {
            alert('请输入有效的最低还款金额');
        }
    };
    
    modal.classList.remove('hidden');
}

// 删除确认 - 二次确认
function deleteNextMonthLoanConfirm(id) {
    if (confirm('确定要删除这条借款记录吗？\n\n此操作不可撤销！')) {
        if (confirm('再次确认：删除后将无法恢复这条借款记录。\n\n确定要继续删除吗？')) {
            deleteNextMonthLoan(id);
            alert('借款记录已删除！');
        }
    }
}

function deleteInstallmentLoanConfirm(id) {
    if (confirm('确定要删除这条分期借款记录吗？\n\n此操作不可撤销！')) {
        if (confirm('再次确认：删除后将无法恢复这条分期借款记录。\n\n确定要继续删除吗？')) {
            deleteInstallmentLoan(id);
            alert('分期借款记录已删除！');
        }
    }
}

// 初始化应用
function initApp() {
    // 初始化数据
    debtData = initData();
    
    // 设置默认日期为今天
    const today = formatDate(new Date());
    document.getElementById('nextMonthBorrowDate').value = today;
    document.getElementById('nextMonthRepayDate').value = calculateRepayDate(today);
    document.getElementById('installmentBorrowDate').value = today;
    
    // 设置分期付款表单的自动计算
    const installmentForm = document.getElementById('installmentForm');
    if (installmentForm) {
        // 确保元素存在再添加事件监听器
        if (installmentForm.elements.installmentAmount) {
            installmentForm.elements.installmentAmount.addEventListener('input', updateInstallmentPayment);
        }
        if (installmentForm.elements.installmentTerm) {
            installmentForm.elements.installmentTerm.addEventListener('input', updateInstallmentPayment);
        }
        if (installmentForm.elements.installmentRate) {
            installmentForm.elements.installmentRate.addEventListener('input', updateInstallmentPayment);
        }
    } else {
        console.error('未找到分期付款表单');
    }
    
    // 绑定本月借下月还款表单提交事件
    document.getElementById('nextMonthForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const form = e.target;
        const today = formatDate(new Date());

        // 定义表单验证规则
        const rules = {
            nextMonthPlatform: {
                required: true,
                label: '借款平台'
            },
            nextMonthAmount: {
                required: true,
                type: 'number',
                min: 0.01,
                label: '借款金额'
            },
            nextMonthBorrowDate: {
                required: true,
                type: 'date',
                label: '借款日期'
            },
            nextMonthRepayDate: {
                required: true,
                type: 'date',
                label: '还款日期'
            }
        };

        // 执行表单验证
        const errors = validateForm(form, rules);
        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        // 验证通过，获取表单数据
        const platform = form.elements.nextMonthPlatform.value;
        const amount = form.elements.nextMonthAmount.value;
        const borrowDate = form.elements.nextMonthBorrowDate.value;
        const repayDate = form.elements.nextMonthRepayDate.value;
        const rate = form.elements.nextMonthRate.value;
        const minRate = form.elements.nextMonthMinRate.value;
        const remarks = form.elements.nextMonthRemarks.value;

        try {
            console.log('准备添加借款记录:', {platform, amount, borrowDate, repayDate, remarks});
            addNextMonthLoan(platform, amount, borrowDate, repayDate, rate, minRate, remarks);
            console.log('借款记录添加成功');

            // 添加成功反馈
            alert('借款记录添加成功！');

            // 重置表单
            form.reset();
            form.elements.nextMonthBorrowDate.value = today;
            form.elements.nextMonthRepayDate.value = calculateRepayDate(today);
        } catch (error) {
            console.error('添加借款记录失败:', error);
            alert('添加借款记录失败: ' + error.message);
        }
    });
    
    // 绑定分期还款表单提交事件
    document.getElementById('installmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const form = e.target;
        const today = formatDate(new Date());

        // 定义表单验证规则
        const rules = {
            installmentPlatform: {
                required: true,
                label: '借款平台'
            },
            installmentAmount: {
                required: true,
                type: 'number',
                min: 0.01,
                label: '借款金额'
            },
            installmentTerm: {
                required: true,
                type: 'integer',
                min: 1,
                max: 24,
                label: '分期期数'
            },
            installmentRate: {
                type: 'number',
                min: 0,
                max: 100,
                label: '年利率'
            },
            installmentPayment: {
                required: true,
                type: 'number',
                min: 0.01,
                label: '每期还款'
            },
            installmentBorrowDate: {
                required: true,
                type: 'date',
                label: '借款日期'
            },
            installmentNextRepayDate: {
                required: true,
                type: 'date',
                label: '下一还款日期'
            },
            installmentRemarks: {
                label: '备注',
                maxLength: 255
            }
        };

        // 执行表单验证
        const errors = validateForm(form, rules);
        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        // 验证通过，获取表单数据
        const platform = form.elements.installmentPlatform.value;
        const amount = form.elements.installmentAmount.value;
        const terms = form.elements.installmentTerm.value;
        const rate = form.elements.installmentRate.value;
        const monthlyPayment = form.elements.installmentPayment.value;
        const borrowDate = form.elements.installmentBorrowDate.value;
        const nextRepayDate = form.elements.installmentNextRepayDate.value;
        const remarks = form.elements.installmentRemarks.value;

        try {
            addInstallmentLoan(platform, amount, terms, rate, monthlyPayment, borrowDate, nextRepayDate, remarks);

            // 添加成功反馈
            alert('分期借款记录添加成功！');

            // 重置表单
            form.reset();
            form.elements.installmentTerm.value = 12;
            form.elements.installmentBorrowDate.value = today;
            form.elements.installmentRate.value = 0;
            form.elements.installmentPayment.value = '';
        } catch (error) {
            console.error('添加分期借款记录失败:', error);
            alert('添加分期借款记录失败: ' + error.message);
        }
    });
    
    // 绑定排序事件
    document.getElementById('nextMonthSort').addEventListener('change', renderNextMonthLoans);
    document.getElementById('installmentSort').addEventListener('change', renderInstallmentLoans);
    
    // 绑定导入导出重置按钮事件
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('resetBtn').addEventListener('click', resetData);
    
    // 绑定导入模态框事件
    document.getElementById('importBtn').addEventListener('click', function() {
        document.getElementById('importModal').classList.remove('hidden');
    });
    
    // 绑定文件拖放区域事件
    const fileDropArea = document.getElementById('fileDropArea');
    const importFileInput = document.getElementById('importFileInput');
    const confirmImportBtn = document.getElementById('confirmImport');
    let selectedFile = null;
    
    fileDropArea.addEventListener('click', function() {
        importFileInput.click();
    });
    
    importFileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            selectedFile = this.files[0];
            confirmImportBtn.disabled = false;
        }
    });
    
    fileDropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('border-primary');
    });
    
    fileDropArea.addEventListener('dragleave', function() {
        this.classList.remove('border-primary');
    });
    
    fileDropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('border-primary');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            selectedFile = e.dataTransfer.files[0];
            confirmImportBtn.disabled = false;
        }
    });
    
    document.getElementById('confirmImport').addEventListener('click', function() {
        if (selectedFile) {
            importData(selectedFile);
            document.getElementById('importModal').classList.add('hidden');
            selectedFile = null;
            importFileInput.value = '';
            confirmImportBtn.disabled = true;
        }
    });
    
    // 绑定模态框关闭事件
    document.getElementById('closeEditModal').addEventListener('click', function() {
        document.getElementById('editModal').classList.add('hidden');
    });
    
    document.getElementById('cancelEdit').addEventListener('click', function() {
        document.getElementById('editModal').classList.add('hidden');
    });
    
    document.getElementById('closeDetailModal').addEventListener('click', function() {
        document.getElementById('installmentDetailModal').classList.add('hidden');
    });
    
    document.getElementById('closeDetail').addEventListener('click', function() {
        document.getElementById('installmentDetailModal').classList.add('hidden');
    });
    
    document.getElementById('closeImportModal').addEventListener('click', function() {
        document.getElementById('importModal').classList.add('hidden');
    });
    
    document.getElementById('cancelImport').addEventListener('click', function() {
        document.getElementById('importModal').classList.add('hidden');
    });
    
    // 绑定提醒关闭事件
    document.getElementById('closeReminder').addEventListener('click', function() {
        document.getElementById('reminderBanner').classList.add('hidden');
    });
    
    // 初始化显示
    renderNextMonthLoans();
    renderInstallmentLoans();
    updateSummary();
    updateCharts();
}

// 更新分期还款金额
function updateInstallmentPayment() {
    const form = document.getElementById('installmentForm');
    const amount = form.elements.installmentAmount.value;
    const terms = form.elements.installmentTerm.value;
    const rate = form.elements.installmentRate.value;
    
    if (amount && terms) {
        const payment = calculateMonthlyPayment(parseFloat(amount), parseFloat(rate), parseInt(terms));
        form.elements.installmentPayment.value = payment.toFixed(2);
        
        // 计算并设置下一期还款日
        const borrowDate = form.elements.installmentBorrowDate.value;
        if (borrowDate) {
            form.elements.installmentNextRepayDate.value = calculateRepayDate(borrowDate);
        }
    }
}

// 添加示例数据
function addSampleData() {
    // 防止重复添加示例数据
    if (debtData.nextMonthLoans.length > 0 || debtData.installmentLoans.length > 0) {
        return;
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const twoMonthsLater = new Date(today);
    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
    
    // 添加本月借下月还款示例
    addNextMonthLoan('花呗', 1299.99, formatDate(lastWeek), formatDate(nextMonth), 12.0, 10.0, '购买电子产品');
    addNextMonthLoan('信用卡', 3500.00, formatDate(yesterday), formatDate(nextMonth), 15.0, 10.0, '购物消费');
    addNextMonthLoan('美团月付', 256.50, formatDate(today), formatDate(nextMonth), 20.0, 15.0, '餐饮消费');
    addNextMonthLoan('借呗', 1000.00, formatDate(twoMonthsLater), formatDate(nextMonth), 18.0, 10.0, '个人消费');
    
    // 添加分期还款示例
    addInstallmentLoan('美团借钱', 10000.00, 12, 12.0, 906.64, formatDate(today), formatDate(nextMonth), '个人消费');
    addInstallmentLoan('借呗', 5000.00, 6, 10.0, 864.40, formatDate(lastWeek), formatDate(nextMonth), '紧急支出');
    
    // 只需调用一次初始化渲染
    renderNextMonthLoans();
    renderInstallmentLoans();
    updateSummary();
    updateCharts();
}



// 当文档加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    initApp();
    
    // 初始化平台管理功能
    initPlatformManager();
    window.platformManagerInitialized = true;
});

// 暴露必要的函数到全局作用域，以便HTML中直接调用
window.initData = initData;
window.addNextMonthLoan = addNextMonthLoan;
window.editNextMonthLoan = editNextMonthLoan;
window.deleteNextMonthLoan = deleteNextMonthLoan;
window.markNextMonthLoanAsPaid = markNextMonthLoanAsPaid;
window.processMinimumPayment = processMinimumPayment;
window.renderNextMonthLoans = renderNextMonthLoans;
window.addInstallmentLoan = addInstallmentLoan;
window.editInstallmentLoan = editInstallmentLoan;
window.deleteInstallmentLoan = deleteInstallmentLoan;
window.markInstallmentAsPaid = markInstallmentAsPaid;
window.renderInstallmentLoans = renderInstallmentLoans;
window.showInstallmentDetails = showInstallmentDetails;
window.updateSummary = updateSummary;
window.updateCharts = updateCharts;
window.exportData = exportData;
window.importData = importData;
window.resetData = resetData;
window.editNextMonthLoanModal = editNextMonthLoanModal;
window.editInstallmentLoanModal = editInstallmentLoanModal;
window.showMinimumPaymentModal = showMinimumPaymentModal;
window.deleteNextMonthLoanConfirm = deleteNextMonthLoanConfirm;
window.deleteInstallmentLoanConfirm = deleteInstallmentLoanConfirm;
window.addPlatform = addPlatform;
window.deletePlatform = deletePlatform;
window.updatePlatformDropdowns = updatePlatformDropdowns;
window.renderPlatformList = renderPlatformList;
window.showPlatformManagerModal = showPlatformManagerModal;
window.hidePlatformManagerModal = hidePlatformManagerModal;

// 平台管理模态框功能
function showPlatformManagerModal() {
    const modal = document.getElementById('platformManagerModal');
    if (modal) {
        renderPlatformList();
        modal.classList.remove('hidden');
    }
}

function hidePlatformManagerModal() {
    const modal = document.getElementById('platformManagerModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function renderPlatformList() {
    const platformList = document.getElementById('platformList');
    if (platformList) {
        platformList.innerHTML = '';
        
        // 获取当前数据
        const currentData = initData();
        
        currentData.platforms.forEach(platform => {
            const platformItem = document.createElement('div');
            platformItem.className = 'flex justify-between items-center p-2 bg-gray-50 rounded-md';

            const platformName = document.createElement('span');
            platformName.textContent = platform;

            const actionButtons = document.createElement('div');
            actionButtons.className = 'flex space-x-2';

            if (platform !== '其他') {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'px-2 py-1 bg-danger text-white rounded-md hover:bg-danger/90 text-sm';
                deleteBtn.innerHTML = '<i class="fa fa-trash mr-1" aria-hidden="true"></i>删除';
                deleteBtn.onclick = function() {
                    if (confirm(`确定要删除平台"${platform}"吗？`)) {
                        deletePlatform(platform);
                    }
                };
                actionButtons.appendChild(deleteBtn);
            }

            platformItem.appendChild(platformName);
            platformItem.appendChild(actionButtons);
            platformList.appendChild(platformItem);
        });
    }
}

// 初始化平台管理相关事件
function initPlatformManager() {
    // 平台管理按钮点击事件
    const platformManagerBtn = document.getElementById('platformManagerBtn');
    if (platformManagerBtn) {
        platformManagerBtn.addEventListener('click', showPlatformManagerModal);
    }

    // 关闭模态框事件
    const closePlatformManagerModal = document.getElementById('closePlatformManagerModal');
    if (closePlatformManagerModal) {
        closePlatformManagerModal.addEventListener('click', hidePlatformManagerModal);
    }
    
    const closePlatformManager = document.getElementById('closePlatformManager');
    if (closePlatformManager) {
        closePlatformManager.addEventListener('click', hidePlatformManagerModal);
    }

    // 添加平台按钮点击事件
    const addPlatformBtn = document.getElementById('addPlatformBtn');
    if (addPlatformBtn) {
        addPlatformBtn.addEventListener('click', function() {
            const newPlatformName = document.getElementById('newPlatformName').value;
            if (addPlatform(newPlatformName)) {
                document.getElementById('newPlatformName').value = '';
                renderPlatformList();
            }
        });
    }

    // 按Enter键添加平台
    const newPlatformNameInput = document.getElementById('newPlatformName');
    if (newPlatformNameInput) {
        newPlatformNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const newPlatformName = this.value;
                if (addPlatform(newPlatformName)) {
                    this.value = '';
                    renderPlatformList();
                }
            }
        });
    }

    // 初始化时更新平台下拉菜单
    updatePlatformDropdowns();
}
