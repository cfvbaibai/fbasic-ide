# 字体文件说明

## 方正锐正黑 (FZRuiZhengHei)

为了使用"方正锐正黑"字体，请将以下字体文件放置在此目录下：

### 必需文件：
- `FZRuiZhengHei.woff2` - 常规字重（推荐格式）
- `FZRuiZhengHei.woff` - 常规字重（备用格式）
- `FZRuiZhengHei.ttf` - 常规字重（备用格式）
- `FZRuiZhengHei-Bold.woff2` - 粗体字重（推荐格式）
- `FZRuiZhengHei-Bold.woff` - 粗体字重（备用格式）
- `FZRuiZhengHei-Bold.ttf` - 粗体字重（备用格式）

### 字体来源：
方正锐正黑是方正字库的商业字体，需要从方正字库官网购买或获取授权。

### 字体格式说明：
- **WOFF2**: 现代浏览器推荐格式，压缩率最高
- **WOFF**: 较老的浏览器支持，压缩率较高
- **TTF**: 通用格式，兼容性最好但文件较大

### 注意事项：
1. 确保字体文件具有合法的使用授权
2. 如果字体文件不存在，系统会自动回退到 Noto Sans SC/TC 字体
3. 字体文件路径在 `src/shared/styles/theme.css` 中的 `@font-face` 声明中配置
