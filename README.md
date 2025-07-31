# SVG 浏览器

一个美观的SVG文件浏览器，支持递归扫描目录并以网格形式展示SVG文件预览。

## 功能特性

- 🔍 **递归扫描**: 输入指定路径，递归遍历找出所有XML文件
- 🎨 **SVG识别**: 智能识别SVG格式的文件
- 📱 **网格展示**: 美观的网格形式展示所有SVG文件预览
- 📊 **统计信息**: 显示扫描统计信息（总文件数、SVG文件数、扫描时间）
- 🎯 **响应式设计**: 支持桌面和移动设备
- ⚡ **实时预览**: 直接在浏览器中预览SVG内容

## 界面特点

- 现代化的渐变背景设计
- 卡片式SVG预览布局
- 悬停动画效果
- 清晰的状态提示
- 移动端适配

## 安装和运行

### 前置要求

- Node.js 14.0.0 或更高版本
- npm 或 yarn

### 安装步骤

1. 克隆或下载项目文件
2. 安装依赖：

```bash
npm install
```

3. 启动服务器：

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

4. 打开浏览器访问：`http://localhost:3000`

## 使用方法

1. 在输入框中输入要扫描的目录路径
2. 点击"开始扫描"按钮
3. 等待扫描完成
4. 查看网格中展示的SVG文件预览

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express.js
- **文件系统**: Node.js fs.promises API
- **样式**: 纯CSS，包含响应式设计和动画效果

## 项目结构

```
svgPreviewer/
├── index.html          # 主页面文件
├── server.js           # Node.js服务器
├── package.json        # 项目配置和依赖
└── README.md          # 项目说明文档
```

## API接口

### POST /api/scan
扫描指定目录的SVG文件

**请求体:**
```json
{
  "path": "/path/to/directory"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "allFiles": ["file1.txt", "file2.svg"],
    "svgFiles": [
      {
        "path": "/path/to/file.svg",
        "name": "file.svg",
        "content": "<svg>...</svg>",
        "size": 1024,
        "modified": "2023-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "扫描完成！发现 1 个SVG文件"
}
```

### GET /api/health
健康检查接口

**响应:**
```json
{
  "status": "ok",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 支持的SVG文件类型

- `.svg` 文件
- `.xml` 文件（包含SVG内容）

## 注意事项

- 确保有足够的权限访问指定目录
- 大目录扫描可能需要较长时间
- SVG文件内容会直接显示在预览中
- 支持嵌套目录的递归扫描

## 开发

### 添加新功能

1. 修改 `server.js` 添加新的API端点
2. 更新 `index.html` 中的JavaScript代码
3. 根据需要调整CSS样式

### 调试

启动开发模式以启用自动重启：

```bash
npm run dev
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！ 