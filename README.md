# 白喵斯的小窝

这是 miyakomeow.github.io 的源代码仓库，使用 Vue 3 + Vite + Deno 构建。

## 项目结构

- `src/` - 源代码文件
- `public/` - 静态资源
- `dist/` - 构建输出目录（由 GitHub Actions 自动构建）

## 本地开发

```bash
# 安装依赖
deno task install

# 启动开发服务器
deno task dev

# 构建生产版本
deno task build
```

## 部署

此项目通过 GitHub Actions 自动部署到 GitHub Pages。当代码推送到 main 分支时，会自动触发构建和部署流程。

访问: https://miyakomeow.github.io
