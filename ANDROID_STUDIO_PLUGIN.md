# 📱 Android Studio SVG预览器插件

## 🎯 项目概述

这是一个专为Android Studio设计的SVG预览器插件，可以扫描用户电脑上的SVG和Android Vector Drawable文件，并提供美观的网格预览界面。

## ✨ 主要功能

- 🔍 **递归扫描**: 扫描指定目录下的所有SVG和Vector Drawable文件
- 🎨 **网格预览**: 美观的网格布局展示SVG预览
- 📱 **Android支持**: 支持Android Vector Drawable格式
- 🔍 **搜索功能**: 支持文件名和路径搜索
- 📄 **分页显示**: 支持大量文件的分页浏览
- 📋 **双击复制**: 双击图片可复制文件信息
- ⚡ **实时进度**: 显示扫描进度和状态

## 🚀 快速开始

### 1. 启动插件
```bash
# 方法1: 使用启动脚本
./start-plugin.sh

# 方法2: 使用npm
npm run plugin

# 方法3: 直接运行
node android-studio-plugin.js
```

### 2. 访问界面
打开浏览器访问: `http://localhost:3000`

### 3. 开始扫描
- 输入要扫描的目录路径（如：`/Users/username/AndroidProject`）
- 点击"开始扫描"
- 等待扫描完成，查看结果

## 📁 支持的路径格式

### macOS
```
/Users/username/AndroidProject
/Users/username/Documents/MyApp
~/AndroidStudioProjects/MyApp
```

### Windows
```
C:\Users\username\AndroidStudioProjects\MyApp
D:\Projects\AndroidApp
```

### Linux
```
/home/username/AndroidStudioProjects/MyApp
/opt/android/projects
```

## 🔧 配置选项

### 环境变量
```bash
# 设置端口
export PORT=3000

# 设置扫描目录
export DEFAULT_SCAN_PATH="/Users/username/AndroidProject"
```

### 启动参数
```bash
# 指定端口
PORT=8080 npm run plugin

# 指定扫描目录
DEFAULT_SCAN_PATH="/path/to/project" npm run plugin
```

## 📱 Android Studio集成

### 1. 在Android Studio中打开
1. 启动插件: `./start-plugin.sh`
2. 在Android Studio中打开浏览器窗口
3. 访问: `http://localhost:3000`
4. 输入Android项目路径开始扫描

### 2. 常用路径
```
# Android项目根目录
/Users/username/AndroidStudioProjects/MyApp

# 资源目录
/Users/username/AndroidStudioProjects/MyApp/app/src/main/res

# Drawable目录
/Users/username/AndroidStudioProjects/MyApp/app/src/main/res/drawable
```

## 🎨 界面功能

### 主要区域
- **输入框**: 输入要扫描的目录路径
- **扫描按钮**: 开始扫描操作
- **搜索框**: 搜索文件名（不包含路径）
- **预览网格**: 显示SVG文件预览
- **分页控制**: 浏览大量文件

### 交互功能
- **双击复制**: 双击图片复制文件信息
- **悬停预览**: 鼠标悬停显示文件详情
- **搜索过滤**: 实时搜索文件名（不包含路径）
- **分页浏览**: 支持大量文件的分页显示

## 🔍 文件识别

### SVG文件
- 扩展名: `.svg`
- 内容特征: 包含`<svg>`标签和SVG命名空间

### Android Vector Drawable
- 扩展名: `.xml`
- 内容特征: 包含`xmlns:android`和`<vector>`标签

## 🛠️ 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口
   lsof -i :3000
   
   # 杀死进程
   pkill -f "node android-studio-plugin.js"
   
   # 使用其他端口
   PORT=3001 npm run plugin
   ```

2. **权限问题**
   ```bash
   # 确保有读取权限
   chmod +r /path/to/your/project
   ```

3. **路径不存在**
   ```
   错误: 目录不存在: /path/to/directory
   ```
   **解决方案**: 检查路径是否正确，确保目录存在

4. **Node.js版本问题**
   ```bash
   # 检查Node.js版本
   node --version
   
   # 需要Node.js 14.0.0或更高版本
   ```

### 日志查看
```bash
# 查看插件日志
npm run plugin 2>&1 | tee plugin.log

# 实时查看日志
npm run plugin | tee -a plugin.log
```

## 📊 性能优化

### 扫描优化
- 只扫描`.svg`和`.xml`文件
- 内容验证确保文件有效
- 进度显示避免界面卡顿

### 内存优化
- 分页加载避免内存溢出
- 图片懒加载减少初始加载时间
- 缓存机制提高响应速度

## 🔒 安全考虑

### 本地运行
- 插件只在本地运行（127.0.0.1）
- 不暴露到外部网络
- 只读取用户指定的目录

### 文件访问
- 只读取文件内容，不修改
- 支持用户电脑上的任意路径
- 错误处理避免崩溃

## 📈 扩展功能

### 计划中的功能
- [ ] 文件拖拽上传
- [ ] 批量导出功能
- [ ] 主题切换
- [ ] 快捷键支持
- [ ] 插件配置界面

### 自定义开发
```javascript
// 添加自定义文件类型识别
function isCustomFile(content) {
    // 自定义识别逻辑
    return content.includes('custom-tag');
}
```

## 📞 技术支持

### 获取帮助
1. 查看日志文件
2. 检查网络连接
3. 验证文件权限
4. 确认路径正确

### 报告问题
- 描述问题现象
- 提供错误日志
- 说明操作步骤
- 附上系统信息

## 🎯 使用场景

### Android开发
- 预览Vector Drawable文件
- 检查SVG资源
- 批量查看图标

### 设计工作
- 预览设计资源
- 检查SVG质量
- 管理图标库

### 项目管理
- 查看项目资源
- 检查文件完整性
- 资源文档化

现在您可以开始使用Android Studio SVG预览器插件了！ 