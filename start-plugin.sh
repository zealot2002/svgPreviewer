#!/bin/bash

# Android Studio SVG预览器插件启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📱 Android Studio SVG预览器插件${NC}"
echo -e "${YELLOW}================================${NC}"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到Node.js，请先安装Node.js${NC}"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到npm，请先安装npm${NC}"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 安装依赖...${NC}"
    npm install
fi

# 检查插件文件
if [ ! -f "android-studio-plugin.js" ]; then
    echo -e "${RED}❌ 错误: 未找到android-studio-plugin.js文件${NC}"
    exit 1
fi

# 获取端口
PORT=${PORT:-3000}

echo -e "${GREEN}🚀 启动Android Studio SVG预览器插件...${NC}"
echo -e "${YELLOW}📁 默认端口: $PORT${NC}"
echo -e "${YELLOW}🌐 访问地址: http://localhost:$PORT${NC}"
echo -e "${BLUE}💡 提示: 在Android Studio中打开此地址来预览SVG文件${NC}"
echo -e "${YELLOW}⏹️  按 Ctrl+C 停止插件${NC}"
echo ""

# 启动插件
npm run plugin 