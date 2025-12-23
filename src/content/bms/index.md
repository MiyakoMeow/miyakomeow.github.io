# BMS 资源中心 🎵

欢迎来到BMS资源中心！这里汇集了我制作的BMS谱面合集、难度表镜像和相关工具。

## 什么是BMS？

BMS（Be-Music Source）是一种音乐游戏谱面格式，主要用于播放器如Lunatic Rave 2（LR2）和Beatoraja。BMS谱面包含音符数据、音乐文件和背景图像，玩家可以下载并播放这些谱面。

### BMS相关概念

- **SP（Single Play）**: 单人模式，使用7个键位
- **DP（Double Play）**: 双人模式，使用14个键位
- **难度表**: 根据谱面难度排列的表格，帮助玩家选择合适难度的谱面
- **表镜像**: 难度表的镜像副本，提供更快的访问速度和备用访问点

## 我的BMS作品

### 谱面合集

我制作了多个BMS谱面，主要集中在SP和DP模式：

- **SP谱面合集**: 包含我制作的所有Single Play谱面
- **DP谱面合集**: 包含我制作的所有Double Play谱面

每个谱面合集都包含详细的难度信息和下载链接。

### 难度表镜像

为了方便玩家访问，我维护了多个BMS难度表的镜像：

- **主要难度表镜像**: 提供稳定的访问服务
- **更新同步**: 定期同步原表更新
- **性能优化**: 优化加载速度，提供更好的用户体验

## 如何使用这些资源

### 访问谱面合集

1. 点击下方的"SP谱面合集"或"DP谱面合集"链接
2. 浏览谱面列表，查看难度、BPM等信息
3. 点击谱面名称查看详细信息并下载

### 使用难度表镜像

1. 点击"表镜像"链接进入镜像页面
2. 浏览不同的难度表分类
3. 点击表名进入具体的难度表页面
4. 查看谱面难度排列和详细信息

## 技术实现

### 数据来源

- **谱面数据**: 来自我的个人BMS制作
- **难度表数据**: 从官方难度表同步
- **更新机制**: 自动化脚本定期更新数据

### 网站功能

- **响应式设计**: 在手机、平板和电脑上都能良好显示
- **快速搜索**: 支持谱面搜索和筛选
- **实时更新**: 数据更新后自动同步到网站

## 代码示例：BMS数据解析

以下是一个简单的JavaScript函数，用于解析BMS谱面头信息：

```javascript
/**
 * 解析BMS文件头信息
 * @param {string} bmsHeader - BMS文件头部分
 * @returns {Object} 解析后的头信息
 */
function parseBMSHeader(bmsHeader) {
  const header = {};
  const lines = bmsHeader.split("\n");

  lines.forEach((line) => {
    const match = line.match(/^#(\w+)\s+(.+)$/);
    if (match) {
      const [, key, value] = match;
      header[key] = value.trim();
    }
  });

  return header;
}

// 示例使用
const bmsHeader = `#TITLE My BMS Song
#ARTIST MiyakoMeow
#BPM 180
#PLAYLEVEL 7`;
const info = parseBMSHeader(bmsHeader);
console.log(info); // { TITLE: 'My BMS Song', ARTIST: 'MiyakoMeow', BPM: '180', PLAYLEVEL: '7' }
```

## 数学公式：难度计算

BMS谱面的难度通常通过以下公式估算：

**基础难度公式**:

$$
D = \frac{N \times S}{T} \times \frac{B}{100}
$$

其中：

- $D$: 谱面难度
- $N$: 音符数量
- $S$: 平均密度
- $T$: 曲目时长（秒）
- $B$: BPM系数

**进阶难度调整**:

$$
D_{\text{adj}} = D \times \left(1 + \frac{C}{100}\right) \times \left(1 - \frac{E}{200}\right)
$$

## 注意事项

### 使用建议

1. **下载谱面**: 确保你有对应的BMS播放器（如LR2或Beatoraja）
2. **难度选择**: 根据自己的水平选择合适的难度
3. **更新检查**: 定期查看更新，获取最新的谱面和难度表

### 技术支持

如果遇到任何问题或需要帮助，可以通过以下方式联系：

- 查看页面底部的联系方式
- 提交GitHub Issue
- 参考BMS玩家社区

---

> **提示**: 所有谱面和难度表数据会定期更新，建议收藏此页面以便快速访问！
>
> 最后更新: 2024年12月
