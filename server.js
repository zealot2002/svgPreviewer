const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const app = express();
const PORT = 3000;

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

// 递归扫描目录函数
async function scanDirectory(dirPath) {
    const results = {
        allFiles: [],
        svgFiles: []
    };

    try {
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

// SVG识别函数
function isValidSVG(content) {
    // 检查是否包含有效的SVG标签
    const hasSvgTag = /<svg[^>]*>/i.test(content);
    const hasSvgNamespace = /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/i.test(content);
    const hasClosingSvgTag = /<\/svg>/i.test(content);
    
    // 检查是否包含SVG图形元素
    const hasGraphicElements = /<(path|rect|circle|ellipse|line|polyline|polygon|text|g|use|image)[^>]*>/i.test(content);
    
    return hasSvgTag && hasClosingSvgTag && (hasSvgNamespace || hasGraphicElements);
}

// Android Vector Drawable识别函数
function isAndroidVectorDrawable(content) {
    // 检查是否包含Android Vector Drawable特征
    const hasAndroidNamespace = /xmlns:android="http:\/\/schemas\.android\.com\/apk\/res\/android"/i.test(content);
    const hasVectorTag = /<vector[^>]*>/i.test(content);
    const hasClosingVectorTag = /<\/vector>/i.test(content);
    const hasPathElement = /<path[^>]*>/i.test(content);
    
    return hasAndroidNamespace && hasVectorTag && hasClosingVectorTag && hasPathElement;
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
                    
                    results.allFiles.push(fullPath);
                    global.scanProgress.processedFiles++;
                    
                    if (isSvg) {
                        try {
                            const content = await fs.readFile(fullPath, 'utf8');
                            
                            // 更精确的SVG识别算法
                            const isRealSVG = isValidSVG(content);
                            const isAndroidVector = isAndroidVectorDrawable(content);
                            
                            if (isRealSVG || isAndroidVector) {
                                results.svgFiles.push({
                                    path: fullPath,
                                    name: item,
                                    content: content,
                                    size: stat.size,
                                    modified: stat.mtime,
                                    type: isAndroidVector ? 'android-vector' : 'svg'
                                });
                                global.scanProgress.foundSVGFiles++;
                                
                                // 打印发现SVG文件的进度
                                if (global.scanProgress.foundSVGFiles % 100 === 0) {
                                    console.log(`已发现 ${global.scanProgress.foundSVGFiles} 个SVG文件...`);
                                }
                            }
                        } catch (readError) {
                            console.warn(`无法读取文件 ${fullPath}: ${readError.message}`);
                        }
                    }
                }
            } catch (statError) {
                console.warn(`无法访问 ${fullPath}: ${statError.message}`);
            }
        }
    } catch (error) {
        console.error(`扫描目录 ${currentPath} 时出错: ${error.message}`);
    }
}

// API路由
app.post('/api/scan', async (req, res) => {
    const { path: scanPath } = req.body;
    
    if (!scanPath) {
        return res.status(400).json({ error: '请提供目录路径' });
    }

    try {
        // 检查路径是否存在
        const stat = await fs.stat(scanPath);
        if (!stat.isDirectory()) {
            return res.status(400).json({ error: '提供的路径不是一个有效的目录' });
        }

        console.log(`开始扫描目录: ${scanPath}`);
        const results = await scanDirectory(scanPath);
        
        console.log(`扫描完成: 发现 ${results.allFiles.length} 个文件，其中 ${results.svgFiles.length} 个SVG文件`);
        
        // 保存扫描结果到全局变量
        global.scanResults = results;
        
        res.json({
            success: true,
            data: results,
            message: `扫描完成！发现 ${results.svgFiles.length} 个SVG文件`
        });
    } catch (error) {
        console.error('扫描错误:', error);
        res.status(500).json({ 
            error: error.message || '扫描过程中发生错误' 
        });
    }
});

// 获取扫描进度
app.get('/api/scan-progress', (req, res) => {
    res.json({
        success: true,
        data: global.scanProgress || {
            totalFiles: 0,
            processedFiles: 0,
            foundSVGFiles: 0,
            currentDirectory: '',
            isScanning: false
        }
    });
});

// 分页获取SVG文件列表
app.get('/api/svg-files', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search || '';
    
    // 从全局变量获取扫描结果（在实际应用中应该使用数据库或缓存）
    if (!global.scanResults) {
        return res.status(404).json({ error: '请先扫描目录' });
    }
    
    let filteredFiles = global.scanResults.svgFiles;
    
    // 搜索过滤
    if (search) {
        filteredFiles = filteredFiles.filter(file => 
            file.name.toLowerCase().includes(search.toLowerCase()) ||
            file.path.toLowerCase().includes(search.toLowerCase())
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
});

// Android Vector Drawable转换为SVG的函数
function androidVectorToSvg(vectorContent) {
    try {
        // 简单的转换逻辑，将Android Vector Drawable转换为标准SVG
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
        return vectorContent; // 如果转换失败，返回原始内容
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
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 SVG浏览器服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 访问 http://localhost:${PORT} 开始使用`);
});

module.exports = app; 