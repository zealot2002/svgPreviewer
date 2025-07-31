#!/usr/bin/env node

const http = require('http');

// 测试配置
const TEST_CONFIG = {
    host: 'localhost',
    port: 3000,
    timeout: 5000
};

async function testHealthEndpoint() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: TEST_CONFIG.host,
            port: TEST_CONFIG.port,
            path: '/api/health',
            method: 'GET',
            timeout: TEST_CONFIG.timeout
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({ success: true, data: result });
                } catch (error) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

async function testScanEndpoint() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            path: '/home/root/work/test-svgs'
        });

        const req = http.request({
            hostname: TEST_CONFIG.host,
            port: TEST_CONFIG.port,
            path: '/api/scan',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: TEST_CONFIG.timeout
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({ success: true, data: result });
                } catch (error) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 开始测试部署...\n');

    try {
        // 测试健康检查
        console.log('1. 测试健康检查端点...');
        const healthResult = await testHealthEndpoint();
        console.log('✅ 健康检查通过:', healthResult.data);
        console.log('');

        // 测试扫描端点
        console.log('2. 测试扫描端点...');
        const scanResult = await testScanEndpoint();
        console.log('✅ 扫描测试通过:', scanResult.data);
        console.log('');

        console.log('🎉 所有测试通过！部署成功！');
        console.log('🌐 访问地址: http://localhost:3000');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.log('');
        console.log('🔧 故障排除建议:');
        console.log('1. 确保服务器正在运行: npm start');
        console.log('2. 检查端口3000是否被占用');
        console.log('3. 检查防火墙设置');
        console.log('4. 查看服务器日志');
        process.exit(1);
    }
}

// 运行测试
runTests(); 