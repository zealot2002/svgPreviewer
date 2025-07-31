# SVG预览器 - 阿里云ECS部署指南

## 📋 部署前准备

### 1. 阿里云ECS实例要求
- **操作系统**: Ubuntu 20.04/22.04 或 CentOS 7/8
- **内存**: 至少 2GB RAM
- **存储**: 至少 20GB 可用空间
- **网络**: 开放 80 端口（HTTP）
- **安全组**: 允许 SSH (22) 和 HTTP (80) 端口

### 2. 本地环境要求
- **SSH密钥**: 确保可以无密码登录到ECS
- **Git**: 用于代码管理
- **Docker** (可选): 用于容器化部署

## 🚀 部署方式

### 方式一：使用部署脚本（推荐）

1. **准备部署脚本**
```bash
chmod +x deploy.sh
```

2. **执行部署**
```bash
./deploy.sh <服务器IP> <用户名>
```

示例：
```bash
./deploy.sh 123.456.789.012 ubuntu
```

### 方式二：Docker部署

1. **构建并启动容器**
```bash
docker-compose up -d
```

2. **查看运行状态**
```bash
docker-compose ps
```

3. **查看日志**
```bash
docker-compose logs -f svg-previewer
```

### 方式三：手动部署

1. **连接到ECS**
```bash
ssh username@your-server-ip
```

2. **安装依赖**
```bash
# 更新系统
sudo apt-get update

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
sudo npm install -g pm2

# 安装Nginx
sudo apt-get install -y nginx
```

3. **部署应用**
```bash
# 创建项目目录
mkdir -p /home/ubuntu/svgPreviewer
cd /home/ubuntu/svgPreviewer

# 上传项目文件（从本地）
scp -r ./* ubuntu@your-server-ip:/home/ubuntu/svgPreviewer/

# 安装依赖
npm install
```

4. **配置Nginx**
```bash
# 复制nginx配置
sudo cp nginx.conf /etc/nginx/sites-available/svg-previewer
sudo ln -sf /etc/nginx/sites-available/svg-previewer /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试并重启nginx
sudo nginx -t
sudo systemctl reload nginx
```

5. **启动应用**
```bash
# 使用PM2启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔧 配置说明

### 环境变量
- `NODE_ENV`: 生产环境设置为 `production`
- `PORT`: 应用端口，默认 3000

### 端口配置
- **应用端口**: 3000 (内部)
- **HTTP端口**: 80 (外部访问)
- **HTTPS端口**: 443 (可选)

### 安全配置
- 启用安全头
- 配置CSP策略
- 启用gzip压缩
- 静态文件缓存

## 📊 监控和管理

### PM2管理命令
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs svg-previewer

# 重启应用
pm2 restart svg-previewer

# 停止应用
pm2 stop svg-previewer

# 删除应用
pm2 delete svg-previewer
```

### 系统监控
```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看网络连接
netstat -tulpn
```

### 日志管理
```bash
# 查看nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看PM2日志
pm2 logs svg-previewer --lines 100
```

## 🔒 安全建议

### 1. 防火墙配置
```bash
# 只开放必要端口
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. SSL证书配置（推荐）
```bash
# 安装certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com
```

### 3. 定期更新
```bash
# 更新系统
sudo apt-get update && sudo apt-get upgrade -y

# 更新Node.js
sudo npm update -g pm2
```

## 🚨 故障排除

### 常见问题

1. **应用无法启动**
```bash
# 检查端口占用
sudo netstat -tulpn | grep :3000

# 检查PM2状态
pm2 status
pm2 logs svg-previewer
```

2. **Nginx配置错误**
```bash
# 测试nginx配置
sudo nginx -t

# 查看nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

3. **内存不足**
```bash
# 查看内存使用
free -h

# 重启应用
pm2 restart svg-previewer
```

4. **磁盘空间不足**
```bash
# 查看磁盘使用
df -h

# 清理日志
sudo journalctl --vacuum-time=7d
```

## 📈 性能优化

### 1. 应用优化
- 启用gzip压缩
- 配置静态文件缓存
- 使用PM2集群模式

### 2. 系统优化
- 调整内核参数
- 优化文件描述符限制
- 配置swap分区

### 3. 监控告警
- 配置系统监控
- 设置日志轮转
- 配置备份策略

## 🔄 更新部署

### 1. 代码更新
```bash
# 停止应用
pm2 stop svg-previewer

# 更新代码
git pull origin master

# 安装依赖
npm install

# 重启应用
pm2 start svg-previewer
```

### 2. 配置更新
```bash
# 更新nginx配置
sudo cp nginx.conf /etc/nginx/sites-available/svg-previewer
sudo nginx -t && sudo systemctl reload nginx
```

## 📞 技术支持

如果遇到部署问题，请检查：
1. 服务器网络连接
2. 端口是否开放
3. 系统资源使用情况
4. 应用日志信息

更多帮助请参考项目文档或提交Issue。 