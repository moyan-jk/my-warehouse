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
        }
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
        
        // 这里可以添加localStorage空间检查逻辑
        // 简单的示例，实际应用可能需要更复杂的处理
        if (estimatedSize > 5 * 1024 * 1024) { // 超过5MB
            console.warn('数据大小超过localStorage建议限制');
        }
        
        localStorage.setItem(STORAGE_KEY, jsonString);
        return true;
    } catch (error) {
        console.error('保存数据失败:', error);
        return false;
    }
}

// 其他函数定义...

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表
    // initCharts();
    // 初始化平台管理
    // initPlatformManager();
    // 其他初始化代码...
    
    // 暂时注释掉初始化函数，确保文件能正常加载
    console.log('应用已加载');
});

// 确保文件有一个明确的结束点
const APP_LOADED = true;