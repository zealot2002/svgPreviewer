#!/bin/bash

# SVG预览器打包脚本
# 安全地创建代码包，避免包含压缩包本身

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}📦 开始创建SVG预览器代码包...${NC}"

# 检查是否在正确的目录
if [ ! -f "package.json" ] || [ ! -f "server.js" ] || [ ! -f "index.html" ]; then
    echo -e "${RED}❌ 错误: 请在项目根目录执行此脚本${NC}"
    exit 1
fi

# 删除旧的压缩包（如果存在）
if [ -f "svgPreviewer.tar.gz" ]; then
    echo -e "${YELLOW}🗑️  删除旧的压缩包...${NC}"
    rm svgPreviewer.tar.gz
fi

# 创建临时目录
TEMP_DIR="temp_package"
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

echo -e "${GREEN}📁 创建临时目录...${NC}"
mkdir "$TEMP_DIR"

# 复制必要的文件到临时目录
echo -e "${GREEN}📋 复制项目文件...${NC}"

# 核心文件
cp package.json "$TEMP_DIR/"
cp server.js "$TEMP_DIR/"
cp index.html "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp start.sh "$TEMP_DIR/"
cp test.js "$TEMP_DIR/"
cp test-deployment.js "$TEMP_DIR/"
cp upload-to-ecs.sh "$TEMP_DIR/"
cp SERVER_USAGE.md "$TEMP_DIR/"

# 部署相关文件
cp deploy.sh "$TEMP_DIR/"
cp Dockerfile "$TEMP_DIR/"
cp docker-compose.yml "$TEMP_DIR/"
cp nginx.conf "$TEMP_DIR/"
cp DEPLOYMENT.md "$TEMP_DIR/"

# 配置文件
cp .gitignore "$TEMP_DIR/"

# 测试文件
if [ -d "test-svgs" ]; then
    cp -r test-svgs "$TEMP_DIR/"
fi

# 创建压缩包
echo -e "${GREEN}🗜️  创建压缩包...${NC}"
cd "$TEMP_DIR"
tar -czf ../svgPreviewer.tar.gz *
cd ..

# 清理临时目录
echo -e "${GREEN}🧹 清理临时文件...${NC}"
rm -rf "$TEMP_DIR"

# 显示结果
PACKAGE_SIZE=$(du -h svgPreviewer.tar.gz | cut -f1)
echo -e "${GREEN}✅ 代码包创建完成！${NC}"
echo -e "${YELLOW}📦 文件名: svgPreviewer.tar.gz${NC}"
echo -e "${YELLOW}📏 大小: $PACKAGE_SIZE${NC}"
echo -e "${YELLOW}📁 位置: $(pwd)/svgPreviewer.tar.gz${NC}"

echo -e "${GREEN}🚀 现在可以使用以下命令上传到ECS:${NC}"
echo -e "${YELLOW}scp svgPreviewer.tar.gz root@YOUR_ECS_IP:~/work/${NC}"
echo -e "${YELLOW}或者使用上传脚本: ./upload-to-ecs.sh YOUR_ECS_IP${NC}" 