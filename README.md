# 天坑劝退计算器

选专业有风险，入坑需谨慎 —— 测测你的福气指数

## 技术栈

- Vue 3 + Vite
- 原生 JavaScript（无 UI框架）
- localStorage 持久化
- WebSocket 实时通信（多人 PK模式）

## 快速启动

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
src/
├── App.vue                    # 主应用组件
├── main.js # 入口文件
├── components/ # Vue 组件
│   ├── SearchBar.vue         # 专业搜索
│   ├── ScoreCard.vue        # 评分卡片
│   ├── RadarChart.vue       # 雷达图
│   ├── WeightSliders.vue # 权重滑块
│   ├── PkArena.vue          # PK 战场（多人模式）
│   ├── PkPlayerCard.vue     # PK 玩家卡片
│   └── PkEntryModal.vue      # PK 加入/创建弹窗
├── composables/              # 组合式函数
│   ├── useCalculator.js      # 评分计算
│   ├── usePersistence.js     # localStorage 持久化
│   ├── useUrlSync.js         # URL 状态同步
│   ├── usePkRoom.js          # PK 模式（localStorage 版本）
│   └── usePkRoomWebSocket.js # PK 模式（WebSocket 版本）
└── data/
    └── majors.json          # 专业数据
```

## 功能

- [x] 专业搜索和选择
- [x] 多维度权重调节
- [x] 劝退指数计算
- [x] 雷达图可视化
- [x] 专业对比（最多3个）
- [x] 收藏功能
- [x] 主题切换（浅色/深色）
- [x] 多人 PK 模式
- [x] 分享链接
- [x] 弹幕特效

## 多人 PK 模式

### 本地模式（localStorage）

纯前端实现，适合同浏览器多标签页。

### WebSocket 模式（需要后端）

连接 Spring Boot 后端，支持跨浏览器实时同步。

**后端地址配置** (`.env.development`):
```bash
VITE_PK_API_URL=http://localhost:8080
VITE_PK_WS_URL=ws://localhost:8080/ws/pk
```

**启动后端**:
```bash
cd quanzhi-calc-backend
mvn spring-boot:run
```

## 部署

前端构建后部署到静态服务器或 CDN。

**生产环境配置** (`.env.production`):
```bash
VITE_BASE_PATH=/                    # 根路径
VITE_PK_API_URL=https://your-backend.com
VITE_PK_WS_URL=wss://your-backend.com/ws/pk
```

## License

MIT