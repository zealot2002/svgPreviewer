#!/bin/bash

# SVG预览器阿里云ECS部署脚本
# 使用方法: ./deploy.sh [服务器IP] [用户名]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查参数
if [ $# -lt 2 ]; then
    echo -e "${RED}使用方法: $0 <服务器IP> <用户名>${NC}"
    echo -e "${YELLOW}示例: $0 123.456.789.012 ubuntu${NC}"
    exit 1
fi

SERVER_IP=$1
USERNAME=$2
PROJECT_NAME="svgPreviewer"
REMOTE_DIR="/home/$USERNAME/$PROJECT_NAME"

echo -e "${GREEN}🚀 开始部署SVG预览器到阿里云ECS...${NC}"
echo -e "${YELLOW}服务器IP: $SERVER_IP${NC}"
echo -e "${YELLOW}用户名: $USERNAME${NC}"
echo -e "${YELLOW}项目名称: $PROJECT_NAME${NC}"

# 1. 检查本地文件
echo -e "${GREEN}📋 检查本地文件...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 未找到package.json文件${NC}"
    exit 1
fi

if [ ! -f "server.js" ]; then
    echo -e "${RED}错误: 未找到server.js文件${NC}"
    exit 1
fi

if [ ! -f "index.html" ]; then
    echo -e "${RED}错误: 未找到index.html文件${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 本地文件检查完成${NC}"

# 2. 创建部署包
echo -e "${GREEN}📦 创建部署包...${NC}"
DEPLOY_DIR="deploy_temp"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# 复制必要文件
cp package.json $DEPLOY_DIR/
cp server.js $DEPLOY_DIR/
cp index.html $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/

# 创建启动脚本
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 启动SVG预览器..."
npm start
EOF

chmod +x $DEPLOY_DIR/start.sh

# 创建PM2配置文件
cat > $DEPLOY_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'svg-previewer',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# 创建nginx配置
cat > $DEPLOY_DIR/nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 创建安装脚本
cat > $DEPLOY_DIR/install.sh << 'EOF'
#!/bin/bash

echo "🔧 安装系统依赖..."
sudo apt-get update
sudo apt-get install -y curl wget git

echo "📦 安装Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "🔧 安装PM2..."
sudo npm install -g pm2

echo "🔧 安装Nginx..."
sudo apt-get install -y nginx

echo "📦 安装项目依赖..."
npm install

echo "✅ 安装完成！"
EOF

chmod +x $DEPLOY_DIR/install.sh

echo -e "${GREEN}✅ 部署包创建完成${NC}"

# 3. 上传到服务器
echo -e "${GREEN}📤 上传文件到服务器...${NC}"
ssh $USERNAME@$SERVER_IP "mkdir -p $REMOTE_DIR"
scp -r $DEPLOY_DIR/* $USERNAME@$SERVER_IP:$REMOTE_DIR/

echo -e "${GREEN}✅ 文件上传完成${NC}"

# 4. 在服务器上执行安装
echo -e "${GREEN}🔧 在服务器上执行安装...${NC}"
ssh $USERNAME@$SERVER_IP "cd $REMOTE_DIR && chmod +x install.sh && ./install.sh"

# 5. 配置nginx
echo -e "${GREEN}🔧 配置Nginx...${NC}"
ssh $USERNAME@$SERVER_IP "sudo cp $REMOTE_DIR/nginx.conf /etc/nginx/sites-available/svg-previewer"
ssh $USERNAME@$SERVER_IP "sudo ln -sf /etc/nginx/sites-available/svg-previewer /etc/nginx/sites-enabled/"
ssh $USERNAME@$SERVER_IP "sudo rm -f /etc/nginx/sites-enabled/default"
ssh $USERNAME@$SERVER_IP "sudo nginx -t && sudo systemctl reload nginx"

# 6. 启动应用
echo -e "${GREEN}🚀 启动应用...${NC}"
ssh $USERNAME@$SERVER_IP "cd $REMOTE_DIR && pm2 start ecosystem.config.js"
ssh $USERNAME@$SERVER_IP "pm2 save"
ssh $USERNAME@$SERVER_IP "pm2 startup"

# 7. 清理本地临时文件
echo -e "${GREEN}🧹 清理临时文件...${NC}"
rm -rf $DEPLOY_DIR

echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${YELLOW}🌐 访问地址: http://$SERVER_IP${NC}"
echo -e "${YELLOW}📊 PM2状态: ssh $USERNAME@$SERVER_IP 'pm2 status'${NC}"
echo -e "${YELLOW}📝 查看日志: ssh $USERNAME@$SERVER_IP 'pm2 logs svg-previewer'${NC}"
echo -e "${YELLOW}🔄 重启应用: ssh $USERNAME@$SERVER_IP 'cd $REMOTE_DIR && pm2 restart svg-previewer'${NC}" 