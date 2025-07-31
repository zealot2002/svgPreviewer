const fs = require('fs').promises;
const path = require('path');

async function testSVGScanner() {
    console.log('🧪 测试SVG浏览器功能...\n');

    // 测试1: 检查文件是否存在
    console.log('1. 检查必要文件...');
    const requiredFiles = ['index.html', 'server.js', 'package.json'];
    for (const file of requiredFiles) {
        try {
            await fs.access(file);
            console.log(`   ✅ ${file} 存在`);
        } catch (error) {
            console.log(`   ❌ ${file} 不存在`);
            return false;
        }
    }

    // 测试2: 检查依赖是否安装
    console.log('\n2. 检查依赖...');
    try {
        await fs.access('node_modules');
        console.log('   ✅ node_modules 存在');
    } catch (error) {
        console.log('   ❌ node_modules 不存在，请运行 npm install');
        return false;
    }

    // 测试3: 检查测试SVG文件
    console.log('\n3. 检查测试SVG文件...');
    try {
        const testFiles = await fs.readdir('test-svgs');
        const svgFiles = testFiles.filter(file => file.endsWith('.svg'));
        console.log(`   ✅ 找到 ${svgFiles.length} 个测试SVG文件`);
        
        for (const file of svgFiles) {
            const content = await fs.readFile(path.join('test-svgs', file), 'utf8');
            if (content.includes('<svg')) {
                console.log(`   ✅ ${file} 包含有效的SVG内容`);
            } else {
                console.log(`   ❌ ${file} 不包含有效的SVG内容`);
            }
        }
    } catch (error) {
        console.log('   ❌ 无法访问test-svgs目录');
        return false;
    }

    // 测试4: 测试API
    console.log('\n4. 测试API...');
    try {
        const response = await fetch('http://localhost:3000/api/health');
        if (response.ok) {
            console.log('   ✅ 服务器正在运行');
        } else {
            console.log('   ❌ 服务器未响应');
            return false;
        }
    } catch (error) {
        console.log('   ❌ 无法连接到服务器，请确保服务器正在运行');
        return false;
    }

    // 测试5: 测试扫描API
    console.log('\n5. 测试扫描API...');
    try {
        const response = await fetch('http://localhost:3000/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: 'test-svgs' })
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`   ✅ 扫描成功，发现 ${result.data.svgFiles.length} 个SVG文件`);
        } else {
            console.log('   ❌ 扫描API失败');
            return false;
        }
    } catch (error) {
        console.log('   ❌ 扫描API测试失败:', error.message);
        return false;
    }

    console.log('\n🎉 所有测试通过！SVG浏览器功能正常');
    console.log('\n📝 使用说明:');
    console.log('   1. 确保服务器正在运行: npm start');
    console.log('   2. 打开浏览器访问: http://localhost:3000');
    console.log('   3. 输入目录路径并点击"开始扫描"');
    console.log('   4. 查看网格中展示的SVG文件预览');

    return true;
}

// 运行测试
testSVGScanner().catch(console.error); 