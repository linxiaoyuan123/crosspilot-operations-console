# CrossPilot · 跨境电商运营决策中台

面向跨境电商运营岗位的本地决策与执行工具。它把多平台报表导入、利润核算、Listing 优化、广告诊断、库存补货、售后处理和周期复盘串成一条可追踪的运营闭环。

> 仓库内置脱敏样例数据，可复现完整运营流程；项目不包含真实平台账号凭证。

![CrossPilot 运营总览](./docs/screenshots/crosspilot-1920-top.png)

## 项目定位

CrossPilot 不是单纯的数据看板，而是围绕运营人员每天实际要回答的问题设计：

`报表怎么接 → 问题在哪里 → 单品是否赚钱 → 下一步做什么 → 谁在跟进 → 做完怎么复盘`

默认案例是 Amazon 欧洲站家居收纳旗舰店，主币种为 EUR。数据结构同时兼容 TikTok Shop、Shopee 和 Walmart 的常见字段，其中演示库内置 Amazon、TikTok Shop 和 Shopee 三个模拟店铺。

岗位能力覆盖：

- 跨境电商报表清洗、字段映射和 Excel 数据处理
- Listing、广告、库存、订单、退货与账号健康指标分析
- 利润、ACOS、TACOS、ROAS、转化率和库存周转计算
- 可解释规则引擎、问题闭环、执行证据和跨周期复盘
- HTML、Markdown、CSV 和 XLSX 运营报告输出

## 运营闭环

### 1. 运营总览

集中展示净销售额、净利润率、广告占比、库存风险、退货率、评分健康、待执行动作和 SKU 异常榜。关键指标可以继续下钻到 Listing、广告、库存和售后模块。

### 2. 数据导入

支持拖拽上传 CSV 和 XLSX，单文件上限 10 MB、20,000 行。系统可以自动识别四类报表：

- 商品表现
- 广告搜索词
- 库存快照
- 退货与评论

导入流程包含中英文字段自动映射、必填字段校验、重复行与错误行预览、PII 字段跳过和确认入库。买家姓名、邮箱、电话、地址等敏感字段只用于识别，不写入预览数据、数据库或报告。

### 3. Listing 与商品

对每个 SKU 生成标题、五点描述、图片、属性、关键词覆盖和合规性六维评分，并输出上新资料包、产品文案骨架、图片需求清单及利润定价信息。

默认评分权重：

| 维度 | 权重 |
| --- | ---: |
| 标题 | 20% |
| 五点描述 | 20% |
| 图片 | 20% |
| 属性 | 15% |
| 关键词覆盖 | 15% |
| 合规性 | 10% |

### 4. 广告与流量

按广告活动和搜索词查看点击、曝光、花费、广告销售、订单、ACOS、ROAS、CVR 和 CPC。规则引擎会给出加词、否词、降价、暂停或放量建议。

默认规则：

- 15 次点击且无订单：精确否词候选。
- 花费达到阈值且 ACOS 高于目标 1.5 倍：降价或暂停候选。
- 有订单且 ACOS 达到目标：增加预算候选。

### 5. 利润与定价

利润口径固定为：

```text
净利润 = 不含税净销售 - 采购成本 - 平台佣金 - FBA/履约费 - 退款损失 - 广告费
```

系统同时计算单品利润、利润率、广告依赖度、盈亏平衡价和建议售价，支持采购落地成本、平台费率、履约费、退款损失及目标利润率的统一测算。

### 6. 库存与履约

从 FBA 可售、在途、预留、残次品、日均销量和采购交期计算可售天数、安全库存与建议补货量。默认规则：

- 覆盖天数低于“采购交期 + 14 天安全期”：缺货风险。
- 覆盖天数高于 90 天：滞销风险。

```text
可售天数 = 可售库存 / 近 30 天日均销量
```

### 7. 售后与账号

集中处理差评、退货原因、买家消息、索赔、订单缺陷、迟发和取消率，按截止时间标记超时与今日到期事项，并对以下阈值生成预警：

| 指标 | 默认预警线 |
| --- | ---: |
| 店铺评分 | 低于 4.0 |
| 订单缺陷率 | 高于 1.0% |
| 迟发率 | 高于 4.0% |
| 取消率 | 高于 2.5% |

### 8. 运营复盘与动作中心

系统将异常转换为带负责人、优先级、截止时间、证据和执行结果的运营动作。日报、周报和月报可汇总关键指标、异常、动作结果和未关闭事项，并导出：

- HTML：适合浏览器查看或打印。
- Markdown：适合知识库和项目文档。
- CSV：适合继续加工。
- XLSX：包含 `Summary`、`SKU`、`Ads`、`Inventory`、`After-sales` 五个工作表。

## 核心计算口径

| 指标 | 公式 |
| --- | --- |
| 净利润 | 不含税净销售 - 采购成本 - 平台佣金 - FBA/履约费 - 退款损失 - 广告费 |
| 净利率 | 净利润 / 不含税净销售 |
| ACOS | 广告花费 / 广告销售 |
| TACOS | 广告花费 / 总销售 |
| ROAS | 广告销售 / 广告花费 |
| 转化率 | 订单量 / 会话量 |
| 退货率 | 退货数量 / 销量 |
| 可售天数 | 可售库存 / 近 30 天日均销量 |

所有建议均来自可解释指标与固定规则，不使用生成式 AI 生成经营结论。

## 界面预览

| 运营总览 | 数据导入 |
| --- | --- |
| ![运营总览](./docs/screenshots/crosspilot-1920-content.png) | ![数据导入](./docs/screenshots/crosspilot-imports-body-1440.png) |

| Listing 与商品 | 广告与流量 |
| --- | --- |
| ![Listing 与商品](./docs/screenshots/crosspilot-listings-body-1440.png) | ![广告与流量](./docs/screenshots/crosspilot-ads-body-1440.png) |

| 库存与履约 | 售后与账号 |
| --- | --- |
| ![库存与履约](./docs/screenshots/crosspilot-inventory-body-1440.png) | ![售后与账号](./docs/screenshots/crosspilot-aftersales-body-1440.png) |

## 快速启动

### Windows 一键启动

双击项目根目录的 `start-crosspilot.bat`。脚本会检查运行环境、首次自动安装依赖、启动服务，并在页面可以访问后自动打开浏览器。如果服务已经在运行，脚本会直接打开页面。

### 手动启动

环境要求：Node.js 22.5 或更高版本。

```bash
npm install
npm run dev
```

浏览器打开 `http://127.0.0.1:3100`。首次启动会自动创建 `data/crosspilot.db` 和模拟演示数据。

生产模式：

```bash
npm start
```

## Docker

```bash
docker compose up --build
```

应用数据保存在 Docker Volume `crosspilot-data`，数据库路径为 `/app/data/crosspilot.db`。

## 主要 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 服务健康状态 |
| `GET` | `/api/stores` | 店铺、平台和账号健康状态 |
| `GET` | `/api/overview?storeId=1` | 运营总览和异常榜 |
| `GET` | `/api/products?storeId=1` | SKU、利润和 Listing 评分 |
| `GET` | `/api/products/:id/listing-package` | 上新资料包 |
| `GET` | `/api/ads?storeId=1` | 广告搜索词和规则建议 |
| `GET` | `/api/inventory?storeId=1` | 库存风险、可售天数和补货量 |
| `GET` | `/api/after-sales?storeId=1` | 售后、SLA 和账号健康 |
| `GET/POST` | `/api/actions` | 查询或创建运营动作 |
| `PATCH` | `/api/actions/:id` | 执行、延期、关闭并回写证据 |
| `POST` | `/api/actions/refresh` | 根据最新规则重新生成动作 |
| `POST` | `/api/imports/preview` | 解析 CSV/XLSX 并返回映射预览 |
| `PATCH` | `/api/imports/:id/mapping` | 调整字段映射并重新校验 |
| `POST` | `/api/imports/:id/commit` | 确认入库 |
| `GET` | `/api/reports/operations/:storeId?format=html\|md\|csv\|xlsx` | 生成运营复盘报告 |
| `GET/POST` | `/api/knowledge` | 查询或新增运营知识 |

## 数据与安全

- SQLite 使用 WAL、外键和 5 秒忙等待，适合本地单用户演示。
- 单次导入最多 10 MB、20,000 行。
- 敏感字段按字段名识别并在入库前移除。
- 报告下载使用 `Content-Disposition: attachment` 和 `Cache-Control: no-store`。
- 服务设置 CSP、`X-Content-Type-Options`、`Referrer-Policy` 和 `X-Frame-Options`。
- 项目没有登录、云同步和官方平台 API 直连，真实使用前需要补充权限、审计和密钥管理。

核心数据对象包括店铺、SKU/Listing、每日指标、广告搜索词、库存快照、退货评论、售后问题、导入批次、运营动作、动作时间线、周期报告和知识文章。

## 测试与工程化

```bash
npm run check
npm test
```

自动化测试覆盖利润与广告指标、Listing 评分、广告和库存规则、账号健康、CSV/XLSX 导入、PII 排除、动作闭环、HTML/Markdown/CSV/XLSX 报告及五工作表结构。

界面已使用 Playwright 在 1920、1440、980 和 390 像素视口完成回归，覆盖固定导航、Hero 轮播、樱花、波浪、打字机、响应式布局和页面横向溢出检查。

## 项目结构

```text
.
├── docs/
│   ├── architecture.md
│   ├── usage-guide.md
│   └── screenshots/
├── public/
│   ├── app.js
│   ├── crosspilot.css
│   ├── final-shell.css
│   ├── index.html
│   └── styles.css
├── src/
│   ├── app.js
│   ├── imports.js
│   ├── metrics.js
│   ├── reports.js
│   ├── server.js
│   └── store.js
├── scripts/
│   └── launch.mjs
├── tests/api.test.js
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── start-crosspilot.bat
└── package.json
```

## 工程亮点

CrossPilot 将指标口径、规则引擎、动作追踪和报告输出放在同一条数据链路中。每条运营建议都能追溯到原始指标和固定规则，执行结果也会回写到复盘报告，形成可验证的运营闭环。

## License

[MIT](./LICENSE)
