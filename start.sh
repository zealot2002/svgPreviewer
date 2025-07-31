#!/bin/bash

echo "🚀 启动SVG浏览器..."
echo "📁 项目目录: $(pwd)"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "   访问 https://nodejs.org/ 下载安装"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo "🌐 启动服务器..."
echo "   访问 http://localhost:3000 开始使用"
echo "   按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
npm start 