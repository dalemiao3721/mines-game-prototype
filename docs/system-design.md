# 踩地雷遊戲 - 系統設計架構文件

## Context
根據 proposal.md 與 UI mockups，建立一個類 Stake Mines 風格的踩地雷機率遊戲。
採用 Monorepo 架構，前端 Vite+React+TS，後端 Node.js+Express+TS，PostgreSQL 資料庫。

### 整合規格
本遊戲作為 `game-lobby` Monorepo 中的 App 模組（`apps/mines-game/`），透過大廳統一閘道提供服務：
- **前端 Base URL**：`/mine-game/`（透過 Port 3001 閘道代理）
- **行動端 Mobile Route**：`/mine-game/m/`（強制載入 Mobile Pro UI）
- **後端 API**：透過 Port 3002 閘道代理至 `/mine-game/` 路徑
- **PWA**：支援 Manifest 定義與 Service Worker 緩存，透過 `vite-plugin-pwa` 生成
- **錢包整合**：統一透過大廳提供的 API Client 進行餘額操作

---

## 技術選型

| 層次 | 技術 | 理由 |
|------|------|------|
| 套件管理 | pnpm workspaces | Monorepo 最佳選擇，節省磁碟空間 |
| 前端 | Vite + React + TypeScript | 提案指定 |
| 樣式 | TailwindCSS | 提案指定，Glassmorphism UI |
| 後端 | Node.js + Express + TypeScript | 成熟穩定，生態豐富 |
| ORM | Prisma | 型別安全，schema migration 管理 |
| 資料庫 | PostgreSQL | ACID 保障，適合金融數據 |
| 測試 | Vitest | 前後端統一，速度快 |
| Session | In-memory Map (開發) / Redis (生產) | 輕量起步，可擴充 |

---

## Monorepo 目錄結構

```
game-lobby/apps/mines-game/         # 作為 game-lobby Monorepo 的子模組
├── package.json                    # Workspace 設定
├── pnpm-workspace.yaml
├── tsconfig.base.json              # 共用 TS 設定
├── .env.example
│
├── packages/
│   └── shared/                     # 前後端共用型別
│       ├── package.json
│       └── src/
│           ├── types/
│           │   ├── game.ts         # GameSession, TileState, GameStatus
│           │   ├── api.ts          # Request/Response DTO
│           │   └── db.ts           # BetRecord, Settlement, DrawLog
│           └── index.ts
│
├── apps/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # DB schema 定義
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── index.ts            # 伺服器入口
│   │       ├── config/
│   │       │   └── rtp.config.ts   # RTP 設定值: 94/96/97/98/99
│   │       ├── routes/
│   │       │   └── game.routes.ts  # POST /start, /pick, /cashout
│   │       ├── controllers/
│   │       │   └── game.controller.ts
│   │       ├── services/
│   │       │   ├── game.service.ts          # 核心遊戲邏輯
│   │       │   ├── provably-fair.service.ts # Seed 生成/Hash/驗證
│   │       │   ├── rtp.service.ts           # 倍率計算
│   │       │   └── session.service.ts       # 回合狀態管理
│   │       ├── db/
│   │       │   └── prisma.client.ts         # Prisma 單例
│   │       ├── utils/
│   │       │   ├── combinatorics.ts         # C(n,r) BigInt 實作
│   │       │   └── id-generator.ts          # BET-/SESS-/SET-/DRAW- ID
│   │       └── middleware/
│   │           ├── validate.ts              # 請求驗證
│   │           └── error-handler.ts
│   │
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts              # base: '/mine-game/'
│       ├── tailwind.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── components/
│           │   ├── GameBoard/
│           │   │   ├── GameBoard.tsx        # 5x5 網格容器
│           │   │   ├── Tile.tsx             # 單格: unrevealed/safe/mine
│           │   │   └── TileGrid.tsx         # 25 個 Tile 排列
│           │   ├── Controls/
│           │   │   ├── BetInput.tsx         # 下注金額輸入（加減按鈕步進值 10，初始值 $100）
│           │   │   ├── MineSelector.tsx     # 1-24 地雷數選擇器
│           │   │   ├── RTPSelector.tsx      # 94/96/97/98/99% 選擇
│           │   │   └── ActionButton.tsx     # Start / Cashout / PLAY AGAIN 按鈕
│           │   ├── Display/
│           │   │   ├── MultiplierDisplay.tsx  # 當前倍率大字顯示
│           │   │   ├── PayoutDisplay.tsx      # 可兌現金額
│           │   │   └── GameResultOverlay.tsx  # 勝/敗結算覆蓋層（炸彈顯示 "$0.00" payout + "-$betAmount lost"）
│           │   └── FairVerifier/
│           │       └── SeedVerifier.tsx     # Provably Fair 驗算工具（已在前端隱藏，同 RTP Selector 處理方式）
│           ├── hooks/
│           │   ├── useGameState.ts          # 遊戲狀態機
│           │   └── useGameAPI.ts            # API 呼叫封裝
│           ├── api/
│           │   └── gameApi.ts               # fetch API 層
│           ├── types/
│           │   └── index.ts                 # 重新匯出 shared types
│           └── utils/
│               └── multiplierCalc.ts        # 前端驗算倍率（可選）
```

---

## 資料庫 Schema (Prisma)

```prisma
model BetRecord {
  betId             String      @id @default(cuid()) @map("bet_id")
  sessionId         String      @unique @map("session_id")
  playerId          String      @map("player_id")
  betAmount         Decimal     @map("bet_amount")
  mineCount         Int         @map("mine_count")
  rtpSetting        Int         @map("rtp_setting")
  status            BetStatus   @default(ACTIVE)
  pickedTiles       Int[]       @map("picked_tiles")
  currentMultiplier Decimal     @default(1.0) @map("current_multiplier")
  serverSeedHash    String      @map("server_seed_hash")
  createdAt         DateTime    @default(now()) @map("created_at")
  updatedAt         DateTime    @updatedAt @map("updated_at")
  settlement        Settlement?
  drawLog           DrawLog?

  @@index([playerId, status])
  @@index([playerId, createdAt])
}

model Settlement {
  settlementId    String    @id @default(cuid()) @map("settlement_id")
  betId           String    @unique @map("bet_id")
  betRecord       BetRecord @relation(fields: [betId], references: [betId])
  outcome         Outcome
  betAmount       Decimal   @map("bet_amount")
  finalMultiplier Decimal   @map("final_multiplier")
  payout          Decimal
  profit          Decimal
  settledAt       DateTime  @default(now()) @map("settled_at")
}

model DrawLog {
  drawId         String    @id @default(cuid()) @map("draw_id")
  betId          String    @unique @map("bet_id")
  betRecord      BetRecord @relation(fields: [betId], references: [betId])
  serverSeed     String    @map("server_seed")
  serverSeedHash String    @map("server_seed_hash")
  clientSeed     String?   @map("client_seed")
  minePositions  Int[]     @map("mine_positions")
  totalTiles     Int       @default(25) @map("total_tiles")
  mineCount      Int       @map("mine_count")
  revealedAt     DateTime  @default(now()) @map("revealed_at")
}

enum BetStatus { ACTIVE SETTLED }
enum Outcome   { WIN LOSE }
```

---

## API 端點設計

### POST /api/game/start
```
Request:  { betAmount: number, mineCount: number, rtp: 94|96|97|98|99 }
Response: { sessionId, serverSeedHash, multiplier: 1.00, nextMultiplier: number }
```
**後端處理流程：**
1. 生成 `serverSeed` = `crypto.randomBytes(32).toString('hex')`
2. `serverSeedHash` = `SHA256(serverSeed)`
3. 使用 `SHA256(serverSeed + ':' + clientSeed)` 確定性洗牌，決定地雷位置
4. Session 存入記憶體 Map（含 serverSeed、minePositions、pickedTiles）
5. 寫入 `bet_records`（status: ACTIVE）

### POST /api/game/pick
```
Request:  { sessionId, tileIndex: 0-24 }
Response (安全): { result: "safe", newMultiplier, nextMultiplier, pickedTiles }
Response (地雷): { result: "mine", serverSeed, minePositions, payout: 0 }
```
**後端處理流程：**
- 驗證 sessionId 有效、tileIndex 未曾選取、遊戲狀態為 active
- 判斷是否為地雷
  - **安全**：更新 pickedTiles、計算新倍率、更新 DB
  - **地雷**：清空 Session，寫入 draw_logs + settlements(LOSE)，更新 bet_records(SETTLED)

### POST /api/game/cashout
```
Request:  { sessionId }
Response: { payout, finalMultiplier, serverSeed, minePositions }
```
**後端處理流程：**
- `payout` = `betAmount × currentMultiplier`
- 寫入 `draw_logs` + `settlements`(WIN)，更新 `bet_records`(SETTLED)
- 清空 Session，公開 serverSeed

---

## 核心演算法

### 倍率計算公式
```
Multiplier = (RTP / 100) × C(25, d) / C(25 - m, d)

n = 25（總格子數）
m = 地雷數量（1~24）
d = 已打開的安全格子數
```

### 組合數計算（BigInt 防溢位）
```typescript
// apps/backend/src/utils/combinatorics.ts
export function combination(n: number, r: number): bigint {
  if (r > n) return 0n
  if (r === 0 || r === n) return 1n
  r = Math.min(r, n - r)
  let result = 1n
  for (let i = 0; i < r; i++) {
    result = (result * BigInt(n - i)) / BigInt(i + 1)
  }
  return result
}

export function calcMultiplier(mineCount: number, openedTiles: number, rtp: number): number {
  if (openedTiles === 0) return 1.0
  const numerator = combination(25, openedTiles)
  const denominator = combination(25 - mineCount, openedTiles)
  if (denominator === 0n) return 0
  const fairMultiplier = Number(numerator) / Number(denominator)
  return parseFloat((fairMultiplier * (rtp / 100)).toFixed(4))
}
```

### Provably Fair 洗牌（Fisher-Yates + Hash Seed）
```typescript
// apps/backend/src/services/provably-fair.service.ts
import crypto from 'crypto'

export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashServerSeed(serverSeed: string): string {
  return crypto.createHash('sha256').update(serverSeed).digest('hex')
}

export function generateMinePositions(
  serverSeed: string,
  clientSeed: string,
  mineCount: number
): number[] {
  const combined = `${serverSeed}:${clientSeed}`
  const hash = crypto.createHash('sha256').update(combined).digest('hex')

  // 從 hash bytes 產生確定性亂數序列，Fisher-Yates shuffle
  const tiles = Array.from({ length: 25 }, (_, i) => i)
  for (let i = tiles.length - 1; i > 0; i--) {
    const byteIndex = (i * 2) % hash.length
    const randomByte = parseInt(hash.slice(byteIndex, byteIndex + 2), 16)
    const j = randomByte % (i + 1)
    ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }

  return tiles.slice(0, mineCount).sort((a, b) => a - b)
}
```

---

## 前端狀態機

```
IDLE ──[下注 + 開始]──────> ACTIVE
ACTIVE ──[點擊安全格]──────> ACTIVE（倍率更新）
ACTIVE ──[點擊地雷]────────> GAME_OVER_LOSE
ACTIVE ──[主動兌現]────────> GAME_OVER_WIN
GAME_OVER_* ──[再玩一局]──> IDLE
```

### `useGameState` Hook 狀態結構
```typescript
interface GameState {
  status: 'idle' | 'active' | 'win' | 'lose'
  tiles: TileState[]          // 25 個格子狀態
  currentMultiplier: number
  potentialPayout: number     // betAmount × currentMultiplier
  sessionId: string | null
  serverSeedHash: string | null
  serverSeed: string | null   // 遊戲結束後公開
  minePositions: number[]     // 遊戲結束後公開
  betAmount: number           // 初始值 $100，步進值 10
  mineCount: number
  rtp: 94 | 96 | 97 | 98 | 99
}

type TileState = 'unrevealed' | 'safe' | 'mine'
```

---

## 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │  GameBoard   │  │   Controls   │  │  FairVerifier     │ │
│  │  5x5 Grid   │  │  Bet/Mines   │  │  Seed Verify Tool │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────┘ │
│         │                 │                                 │
│  ┌──────▼─────────────────▼──────────────────────────────┐  │
│  │          useGameState + useGameAPI                    │  │
│  │          gameApi.ts (fetch HTTP)                      │  │
│  └──────────────────────┬────────────────────────────────┘  │
└─────────────────────────│───────────────────────────────────┘
                          │ HTTP REST
┌─────────────────────────▼───────────────────────────────────┐
│                    Node.js Backend                          │
│                                                             │
│  Express Router → Controller → GameService                  │
│                                    │                        │
│              ┌─────────────────────┼─────────────────────┐  │
│              │                     │                     │  │
│  ProvablyFairService     RTPService          SessionService  │
│  (seed/hash/shuffle)  (multiplier calc)   (in-memory Map)   │
│              │                     │                     │  │
│              └─────────────────────┼─────────────────────┘  │
│                                    │                        │
│                            Prisma ORM                       │
└────────────────────────────────────│────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────┐
│                    PostgreSQL Database                       │
│   bet_records  │  settlements  │  draw_logs                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 整合架構

### 大廳整合模式
Mines Game 作為 `game-lobby` Monorepo 的子模組，透過統一閘道運作：

```
                  Unified Gateway
                  ┌────────────────────┐
Browser ──────►   │ Port 3001 (前端)    │ ──► /mine-game/ ──► Mines 前端 (內部 5173)
                  │ Port 3002 (API)    │ ──► /mine-game/ ──► Mines 後端 (內部 4001)
                  └────────────────────┘
                           │
                           ▼ (結算)
                  大廳後端 Wallet API
                  POST /lobby/api/game/settle
```

### 錢包 API 串接
遊戲結算時，透過大廳 API Client 進行餘額操作：
- `GET /lobby/api/game/balance` — 取得玩家即時餘額
- `POST /lobby/api/game/settle` — 結算下注與獎金
- `POST /lobby/api/game/close-session` — 關閉遊戲 Session

---

## 環境設定

```env
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/mines_game"  # 使用獨立的 mines_game 資料庫
PORT=4001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
BASE_URL=/mine-game/

# 大廳整合
LOBBY_API_URL=http://localhost:3002/lobby
GAME_SECRET=mines-shared-secret
```

---

## 開發腳本

```json
// mines-game/package.json
{
  "scripts": {
    "dev":   "pnpm --parallel -r dev",
    "build": "pnpm -r build",
    "test":  "pnpm -r test"
  }
}
```

> **備註**：開發模式下，Mines 前端在 `localhost:5173`、後端在 `localhost:4001` 運行。
> 透過 game-lobby 的 Unified Gateway（Port 3001/3002）統一對外提供 `/mine-game/` 路由。

---

## 實作階段規劃

| Phase | 內容 | 產出 |
|-------|------|------|
| 1 | Monorepo 環境 + shared 型別 + combinatorics 單元測試 | 通過組合數計算測試 |
| 2 | 後端 Prisma schema + DB migration + Provably Fair service | DB 建立 + 種子驗算通過 |
| 3 | API 端點實作 (start/pick/cashout) + 整合測試 | API 可正常呼叫 |
| 4 | 前端遊戲 UI + TailwindCSS Glassmorphism 風格 | 完整 UI 可互動 |
| 5 | 前後端串接 + E2E 測試 + RTP 模擬驗證 | RTP 誤差 < 1.0% |

---

## RTP 倍率對照驗算（5 顆地雷）

| 打開第幾格 (d) | 公平倍率 (100%) | RTP 99% | RTP 98% | RTP 97% | RTP 96% | RTP 94% |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | 1.250x | 1.238x | 1.225x | 1.213x | 1.200x | 1.175x |
| 2 | 1.579x | 1.563x | 1.547x | 1.531x | 1.516x | 1.484x |
| 3 | 2.018x | 1.997x | 1.977x | 1.957x | 1.937x | 1.896x |
| 4 | 2.611x | 2.585x | 2.559x | 2.532x | 2.506x | 2.454x |
| 5 | 3.427x | 3.393x | 3.358x | 3.324x | 3.290x | 3.221x |

---

## v1.3 更新紀錄 (2026-03-16)

### 前端修正
1. **BetInput 步進值**：加減按鈕步進值改為 10，初始下注金額 $100。
2. **Provably Fair (SeedVerifier)**：前端已隱藏，與 RTP Selector 採用相同處理方式（後端仍完整支援）。
3. **手機版佈局**：上下堆疊（遊戲板在上、控制面板在下），`@media (max-width: 768px)` 響應式切換。
4. **手機版 TileGrid**：移除 `aspect-square`，使用 `calc(100dvh - 440px)` 限制高度。
5. **手機版間距壓縮**：gap: 0, padding: 0 6px, control-card padding: 5px 10px。
6. **`.app__main` 手機版**：`flex: none` 消除空白。
7. **GameResultOverlay**：炸彈顯示 "$0.00" payout + "-$betAmount lost"。
8. **ActionButton**：遊戲結束後顯示 "PLAY AGAIN"。

### 後端修正
1. **DATABASE_URL**：使用獨立 `mines_game` 資料庫（`postgresql://user:password@localhost:5432/mines_game`）。

### PWA 通用修正
1. Viewport meta：`width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`。
2. 全域 CSS：`100vh` → `100dvh`，`-webkit-text-size-adjust: 100%`。
3. 手機版響應式斷點：`@media (max-width: 768px)`。

### Mockup 截圖
- 桌面版：`apps/mines-game/docs/mockups/desktop/mines_idle.png`
- 手機版：`apps/mines-game/docs/mockups/mobile/mines_idle_mobile.png`

---

*文件版本：v1.3 | 日期：2026-03-16*
