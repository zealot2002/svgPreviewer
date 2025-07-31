# 🚀 SVG预览器 - 服务器部署使用指南

## 📋 问题解决

### 路径问题修复
原来的问题是应用在服务器上仍然使用本地Mac的路径。现在已经修复：

1. **默认路径已更改**: 从 `.` 改为 `/home/root/work`
2. **路径验证**: 添加了服务器端路径验证
3. **用户提示**: 前端会检测并提示用户使用正确的服务器路径

## 🔧 部署步骤

### 1. 使用上传脚本（推荐）
```bash
# 在本地项目目录执行
./upload-to-ecs.sh YOUR_ECS_IP
```

### 2. 手动部署
```bash
# 1. 创建代码包
tar -czf svgPreviewer.tar.gz *

# 2. 上传到ECS
scp svgPreviewer.tar.gz root@YOUR_ECS_IP:/home/root/work/

# 3. 在ECS上部署
ssh root@YOUR_ECS_IP
cd /home/root/work
tar -xzf svgPreviewer.tar.gz
cd svgPreviewer
npm install
npm start
```

## 📁 服务器路径说明

### 推荐的扫描路径
- `/home/root/work` - 工作目录
- `/home/root/work/test-svgs` - 测试SVG文件
- `/var/www` - Web目录
- `/opt/apps` - 应用目录

### 避免使用的路径
- `/Users/...` - Mac用户目录
- `C:\...` 或 `D:\...` - Windows路径
- 任何本地开发环境的路径

## 🧪 测试部署

### 1. 健康检查
```bash
curl http://YOUR_ECS_IP:3000/api/health
```

### 2. 扫描测试
```bash
curl -X POST http://YOUR_ECS_IP:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"path": "/home/root/work/test-svgs"}'
```

### 3. 使用测试脚本
```bash
# 在本地测试
node test-deployment.js
```

## 🔍 故障排除

### 常见问题

1. **路径不存在错误**
   ```
   错误: 目录不存在: /Users/zzy/LBank/work/lbank-android-lbank
   ```
   **解决方案**: 使用服务器上的路径，如 `/home/root/work`

2. **权限问题**
   ```bash
   # 确保目录有正确权限
   chmod 755 /home/root/work
   ```

3. **端口被占用**
   ```bash
   # 检查端口使用情况
   netstat -tlnp | grep :3000
   
   # 杀死占用端口的进程
   pkill -f "node server.js"
   ```

4. **防火墙问题**
   ```bash
   # 开放3000端口
   ufw allow 3000
   ```

### 日志查看
```bash
# 查看应用日志
tail -f logs/app.log

# 查看系统日志
journalctl -u svg-previewer -f
```

## 📊 性能优化

### 1. 使用PM2管理进程
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name svg-previewer

# 查看状态
pm2 status

# 查看日志
pm2 logs svg-previewer
```

### 2. 使用Nginx反向代理
```bash
# 安装Nginx
apt update && apt install nginx

# 配置反向代理
# 参考 nginx.conf 文件
```

## 🔒 安全建议

1. **防火墙配置**
   ```bash
   # 只开放必要端口
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```

2. **SSL证书**
   ```bash
   # 使用Let's Encrypt
   certbot --nginx -d your-domain.com
   ```

3. **定期更新**
   ```bash
   # 更新系统
   apt update && apt upgrade
   
   # 更新Node.js
   npm update
   ```

## 📞 技术支持

如果遇到问题：

1. 检查服务器日志
2. 验证路径是否正确
3. 确认网络连接
4. 查看防火墙设置
5. 测试API端点

## 🎯 快速开始

1. **部署应用**
   ```bash
   ./upload-to-ecs.sh YOUR_ECS_IP
   ```

2. **访问应用**
   ```
   http://YOUR_ECS_IP:3000
   ```

3. **开始扫描**
   - 输入路径: `/home/root/work/test-svgs`
   - 点击"开始扫描"
   - 查看结果

现在您的SVG预览器应该可以在阿里云ECS上正常工作了！ 