#!/usr/bin/env node

/**
 * Android Studio SVG预览器插件
 * 用于在Android Studio中预览SVG和Vector Drawable文件
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const app = express();
const PORT = process.env.PORT || 3000;

// 全局变量存储扫描进度
global.scanProgress = {
    totalFiles: 0,
    processedFiles: 0,
    foundSVGFiles: 0,
    currentDirectory: '',
    isScanning: false
};

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// SVG识别函数
function isValidSVG(content) {
    const hasSvgTag = /<svg[^>]*>/i.test(content);
    const hasSvgNamespace = /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/i.test(content);
    const hasClosingSvgTag = /<\/svg>/i.test(content);
    const hasGraphicElements = /<(path|rect|circle|ellipse|line|polyline|polygon|text|g|use|image)[^>]*>/i.test(content);
    
    return hasSvgTag && hasClosingSvgTag && (hasSvgNamespace || hasGraphicElements);
}

// Android Vector Drawable识别函数
function isAndroidVectorDrawable(content) {
    const hasAndroidNamespace = /xmlns:android="http:\/\/schemas\.android\.com\/apk\/res\/android"/i.test(content);
    const hasVectorTag = /<vector[^>]*>/i.test(content);
    const hasClosingVectorTag = /<\/vector>/i.test(content);
    const hasPathElement = /<path[^>]*>/i.test(content);
    
    return hasAndroidNamespace && hasVectorTag && hasClosingVectorTag && hasPathElement;
}

// 递归扫描目录函数
async function scanDirectory(dirPath) {
    const results = {
        allFiles: [],
        svgFiles: []
    };

    try {
        // 验证路径是否存在
        try {
            const stat = await fs.stat(dirPath);
            if (!stat.isDirectory()) {
                throw new Error(`${dirPath} 不是一个有效的目录`);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`目录不存在: ${dirPath}`);
            }
            throw error;
        }

        // 初始化扫描进度
        global.scanProgress = {
            totalFiles: 0,
            processedFiles: 0,
            foundSVGFiles: 0,
            currentDirectory: dirPath,
            isScanning: true
        };

        console.log(`开始扫描目录: ${dirPath}`);
        await scanDirectoryRecursive(dirPath, results);
        
        // 更新最终进度
        global.scanProgress.processedFiles = results.allFiles.length;
        global.scanProgress.foundSVGFiles = results.svgFiles.length;
        global.scanProgress.isScanning = false;
        
        console.log(`扫描完成: 发现 ${results.allFiles.length} 个文件，其中 ${results.svgFiles.length} 个SVG文件`);
        return results;
    } catch (error) {
        global.scanProgress.isScanning = false;
        throw new Error(`扫描目录失败: ${error.message}`);
    }
}

async function scanDirectoryRecursive(currentPath, results) {
    try {
        const items = await fs.readdir(currentPath);
        
        // 更新进度
        global.scanProgress.totalFiles += items.length;
        
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            
            try {
                const stat = await fs.stat(fullPath);
                
                if (stat.isDirectory()) {
                    // 递归扫描子目录
                    await scanDirectoryRecursive(fullPath, results);
                } else if (stat.isFile()) {
                    // 检查是否为SVG文件
                    const ext = path.extname(item).toLowerCase();
                    const isSvg = ext === '.svg' || ext === '.xml';
                    
                    if (isSvg) {
                        try {
                            const content = await fs.readFile(fullPath, 'utf8');
                            const isRealSVG = isValidSVG(content);
                            const isAndroidVector = isAndroidVectorDrawable(content);
                            
                            if (isRealSVG || isAndroidVector) {
                                const fileInfo = {
                                    name: item,
                                    path: fullPath,
                                    size: stat.size,
                                    type: isAndroidVector ? 'android-vector' : 'svg'
                                };
                                
                                results.svgFiles.push(fileInfo);
                                global.scanProgress.foundSVGFiles++;
                                
                                // 每100个文件输出一次进度
                                if (global.scanProgress.foundSVGFiles % 100 === 0) {
                                    console.log(`已发现 ${global.scanProgress.foundSVGFiles} 个SVG文件...`);
                                }
                            }
                        } catch (readError) {
                            console.warn(`无法读取文件 ${fullPath}: ${readError.message}`);
                        }
                    }
                    
                    results.allFiles.push({
                        name: item,
                        path: fullPath,
                        size: stat.size
                    });
                }
                
                global.scanProgress.processedFiles++;
            } catch (statError) {
                console.warn(`无法访问 ${fullPath}: ${statError.message}`);
            }
        }
    } catch (error) {
        console.error(`扫描目录 ${currentPath} 时出错: ${error.message}`);
    }
}

// API路由

// 扫描目录
app.post('/api/scan', async (req, res) => {
    try {
        const { path: scanPath } = req.body;
        
        if (!scanPath) {
            return res.status(400).json({ error: '请提供扫描路径' });
        }
        
        const results = await scanDirectory(scanPath);
        global.scanResults = results;
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取扫描进度
app.get('/api/scan-progress', (req, res) => {
    res.json({
        success: true,
        data: global.scanProgress
    });
});

// 获取SVG文件列表（分页和搜索）
app.get('/api/svg-files', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 200;
        const search = req.query.search || '';
        
        if (!global.scanResults) {
            return res.json({
                success: true,
                data: {
                    files: [],
                    pagination: {
                        page: 1,
                        limit,
                        totalFiles: 0,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false
                    }
                }
            });
        }
        
        let filteredFiles = global.scanResults.svgFiles;
        
        // 搜索过滤 - 只匹配文件名
        if (search) {
            const searchLower = search.toLowerCase();
            filteredFiles = filteredFiles.filter(file => 
                file.name.toLowerCase().includes(searchLower)
            );
        }
        
        const totalFiles = filteredFiles.length;
        const totalPages = Math.ceil(totalFiles / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const files = filteredFiles.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                files,
                pagination: {
                    page,
                    limit,
                    totalFiles,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Android Vector Drawable转换为SVG的函数
function androidVectorToSvg(vectorContent) {
    try {
        let svgContent = vectorContent;
        
        // 替换Android命名空间
        svgContent = svgContent.replace(/xmlns:android="[^"]*"/g, '');
        svgContent = svgContent.replace(/android:/g, '');
        
        // 转换vector标签为svg
        svgContent = svgContent.replace(/<vector/g, '<svg');
        svgContent = svgContent.replace(/<\/vector>/g, '</svg>');
        
        // 转换属性
        svgContent = svgContent.replace(/width="([^"]*dp)"/g, 'width="$1"');
        svgContent = svgContent.replace(/height="([^"]*dp)"/g, 'height="$1"');
        svgContent = svgContent.replace(/viewportWidth="([^"]*)"/g, 'viewBox="0 0 $1 $1"');
        svgContent = svgContent.replace(/viewportHeight="([^"]*)"/g, '');
        
        // 转换path属性
        svgContent = svgContent.replace(/pathData="([^"]*)"/g, 'd="$1"');
        svgContent = svgContent.replace(/fillColor="([^"]*)"/g, 'fill="$1"');
        svgContent = svgContent.replace(/fillType="([^"]*)"/g, 'fill-rule="$1"');
        
        // 添加SVG命名空间
        if (!svgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
            svgContent = svgContent.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        
        return svgContent;
    } catch (error) {
        console.error('转换Android Vector Drawable失败:', error);
        return vectorContent;
    }
}

// 获取文件内容的路由
app.get('/api/file/:filePath(*)', async (req, res) => {
    try {
        const filePath = decodeURIComponent(req.params.filePath);
        const content = await fs.readFile(filePath, 'utf8');
        
        // 检查是否为Android Vector Drawable
        if (content.includes('xmlns:android') && content.includes('<vector')) {
            const svgContent = androidVectorToSvg(content);
            res.json({ content: svgContent, originalType: 'android-vector' });
        } else {
            res.json({ content, originalType: 'svg' });
        }
    } catch (error) {
        res.status(404).json({ error: '文件不存在或无法读取' });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        plugin: 'Android Studio SVG Previewer'
    });
});

// 启动服务器
app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Android Studio SVG预览器插件启动`);
    console.log(`📁 访问 http://localhost:${PORT} 开始使用`);
    console.log(`🔧 支持扫描用户电脑上的SVG和Vector Drawable文件`);
    console.log(`📱 专为Android Studio插件设计`);
});

module.exports = app; 