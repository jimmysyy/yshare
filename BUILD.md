# 📦 资源分享仓库 - 构建指南

## 项目结构

```
yshare/
├── index.html          # 最终生成的网页（由 build.py 生成）
├── template.html       # HTML 模板（包含结构，不包含数据）
├── script.js           # 页面逻辑脚本
├── style.css           # 样式表
├── build.py            # 构建脚本（自动嵌入数据）
├── BUILD.md            # 此文件
└── assets/
    └── data.json       # 数据源（修改此文件来更新内容）
```

## 如何使用

### 1️⃣ 更新内容
编辑 `assets/data.json` 文件，修改你想要的数据内容。

### 2️⃣ 运行构建脚本
```bash
python3 build.py
```

脚本会：
- ✅ 读取 `assets/data.json`
- ✅ 将数据嵌入到 `template.html`
- ✅ 生成新的 `index.html`

### 3️⃣ 查看结果
刷新网页（或在浏览器中打开 `index.html`）即可看到更新后的内容。

---

## 工作原理

```
data.json → build.py → index.html
  ↓
  └─→ 自动嵌入数据，无需HTTP请求
```

### 性能优势
- ⚡ **减少HTTP请求** - 页面加载更快
- 🚀 **零网络延迟** - 数据立即可用
- 🔒 **避免跨域问题** - 所有数据内联在HTML中

---

## 快速开始

**第一次使用：**
```bash
# 1. 确保有 Python 3
python3 --version

# 2. 运行构建脚本
python3 build.py

# 3. 用 HTTP 服务器打开（不能直接双击HTML）
# 方式1: Python
python3 -m http.server 8000

# 方式2: Node.js
npx http-server

# 然后访问 http://localhost:8000
```

---

## 常见问题

**Q: 修改了 data.json 但页面没有更新？**
A: 需要运行 `python3 build.py` 来重新生成 `index.html`。

**Q: 可以不运行脚本，直接在 HTML 中修改数据吗？**
A: 可以，但不推荐。建议总是通过修改 `data.json` 和运行脚本来维护。

**Q: 为什么不能直接打开 HTML？**
A: 为了安全性，浏览器不允许直接打开的 HTML 文件访问本地 JSON 文件（跨域限制）。需要通过 HTTP 服务器访问。

---

## 自动化建议

**VS Code 任务自动化** - 添加到 `.vscode/tasks.json`：
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build HTML",
      "type": "shell",
      "command": "python3",
      "args": ["build.py"],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

然后在 VS Code 中按 `Ctrl+Shift+B` 快速构建。

---

## 脚本帮助

```bash
# 查看脚本内容
cat build.py

# 带详细输出运行
python3 -v build.py
```
