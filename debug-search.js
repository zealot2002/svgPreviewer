#!/usr/bin/env node

const http = require('http');

// 模拟一些测试数据
const testData = {
    svgFiles: [
        { name: 'user_icon.svg', path: '/Users/zzy/project/res/drawable/user_icon.svg' },
        { name: 'home_icon.xml', path: '/Users/zzy/project/res/drawable/home_icon.xml' },
        { name: 'background.svg', path: '/Users/zzy/project/res/drawable/background.svg' },
        { name: 'logo.png', path: '/Users/zzy/project/res/drawable/logo.png' }
    ]
};

// 模拟搜索函数
function searchFiles(files, searchTerm) {
    if (!searchTerm) return files;
    
    const searchLower = searchTerm.toLowerCase();
    return files.filter(file => 
        file.name.toLowerCase().includes(searchLower)
    );
}

console.log('🔍 测试搜索功能...\n');

// 测试搜索 "user"
console.log('测试搜索 "user":');
const userResults = searchFiles(testData.svgFiles, 'user');
userResults.forEach(file => {
    console.log(`  - ${file.name} (路径: ${file.path})`);
});

console.log('\n测试搜索 "home":');
const homeResults = searchFiles(testData.svgFiles, 'home');
homeResults.forEach(file => {
    console.log(`  - ${file.name} (路径: ${file.path})`);
});

console.log('\n测试搜索 "background":');
const bgResults = searchFiles(testData.svgFiles, 'background');
bgResults.forEach(file => {
    console.log(`  - ${file.name} (路径: ${file.path})`);
});

console.log('\n💡 如果搜索 "user" 只返回 user_icon.svg，说明修改成功');
console.log('💡 如果还返回其他文件，说明路径仍然被匹配'); 