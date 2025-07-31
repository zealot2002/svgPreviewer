#!/bin/bash

# SVG预览器上传到阿里云ECS脚本
# 使用方法: ./upload-to-ecs.sh <ECS_IP>

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查参数
if [ $# -lt 1 ]; then
    echo -e "${RED}使用方法: $0 <ECS_IP>${NC}"
    echo -e "${YELLOW}示例: $0 123.456.789.012${NC}"
    exit 1
fi

ECS_IP=$1
REMOTE_DIR="/home/root/work/svgPreviewer"

echo -e "${GREEN}🚀 开始上传SVG预览器到阿里云ECS...${NC}"
echo -e "${YELLOW}ECS IP: $ECS_IP${NC}"

# 1. 创建代码包
echo -e "${GREEN}📦 创建代码包...${NC}"
cd /Users/zzy/hope/svgPreviewer
tar -czf svgPreviewer.tar.gz *

echo -e "${GREEN}✅ 代码包创建完成${NC}"

# 2. 上传到ECS
echo -e "${GREEN}📤 上传代码包到ECS...${NC}"
scp svgPreviewer.tar.gz root@$ECS_IP:/home/root/work/

echo -e "${GREEN}✅ 代码包上传完成${NC}"

# 3. 在ECS上部署
echo -e "${GREEN}🔧 在ECS上部署应用...${NC}"
ssh root@$ECS_IP << 'EOF'
# 创建必要的目录
mkdir -p /home/root/work
mkdir -p /home/root/work/test-svgs

# 解压代码包
cd /home/root/work
tar -xzf svgPreviewer.tar.gz

# 进入项目目录
cd svgPreviewer

# 安装依赖
npm install

# 创建测试SVG文件（如果不存在）
if [ ! -f "../test-svgs/example1.svg" ]; then
    echo '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>' > ../test-svgs/example1.svg
fi

if [ ! -f "../test-svgs/example2.svg" ]; then
    echo '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="10" y="10" width="80" height="80" fill="blue"/></svg>' > ../test-svgs/example2.svg
fi

if [ ! -f "../test-svgs/android_example.xml" ]; then
    echo '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:pathData="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2z" android:fillColor="#FF0000"/></vector>' > ../test-svgs/android_example.xml
fi

# 启动应用
npm start
EOF

echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${YELLOW}🌐 访问地址: http://$ECS_IP:3000${NC}"
echo -e "${YELLOW}📝 查看日志: ssh root@$ECS_IP 'cd /home/root/work/svgPreviewer && tail -f logs/app.log'${NC}" 