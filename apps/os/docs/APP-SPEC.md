# os.zyx.tw — 新增 app 規範

> 這份文件是 M4 的「試金石」產出:用「小算盤」(`calculator`)從零示範一次
> 完整流程,證明終態成立 —— 新增一個 app 只需要一個 manifest + 一個吃 SDK
> hooks 的 component,其餘(視窗、進程、檔案、對話框、開關機)由 OS 層供給。
> 契約細節見 `docs/DESIGN.md`;這份文件只講「怎麼加一個新 app」。

## 步驟(以小算盤為例)

1. **建資料夾**:`components/apps/<id>/`(kebab-case,唯一 id)。小算盤是
   `components/apps/calculator/`。
2. **寫 component**:`<id>.tsx`,`export function XxxApp()`。不接受 props
   ——`Component: React.ComponentType<OsAppProps>` 的 `{ pid }` 沒人會主動
   解構,需要的一切都透過 SDK hooks 取得(見下)。小算盤只用到
   `useDialogs()`(除以零要跳 msgBox)。
3. **寫 manifest**:`manifest.tsx`,匯出 `xxxManifest: OsAppManifest`(欄位
   契約見 `docs/DESIGN.md` 的「App manifest」節)。小算盤範例:
   ```ts
   export const calculatorManifest: OsAppManifest = {
     id: "calculator",
     name: "小算盤",
     description: "基本四則運算。",
     icon: "calculator",
     window: { width: 200, height: 184, resizable: false, controls: ["minimize", "close"] },
     multiInstance: true,
     Component: CalculatorApp,
   }
   ```
4. **抓 icon**:去 win98icons.alexmeub.com(帶瀏覽器 UA,否則會被拒),同一個
   family 通常有多個 `-N.png` 變體(不同尺寸 × 不同色深),用
   `curl -sA "<UA>" .../icons/png/<family>-N.png` 逐一試、用 `file` 指令看
   `PNG image data, 16x16` / `32x32` 挑對的,兩份都要。存成
   `public/icons/<icon-key>-16.png` / `-32.png`,`icon-key` 加進
   `components/pixel-icon.tsx` 的 `IconName` 聯集。小算盤是
   `calculator-16.png` / `calculator-32.png`(family 剛好同名)。
5. **註冊**:`components/apps/registry.ts` 加一行 import + 一行塞進
   `MANIFESTS` 陣列(維持字母序,跟既有 6 個 app 一致)。**這一步同時完成
   start menu 入口**——`components/start-menu.tsx` 的選單項是直接從 `APPS`
   registry 衍生的(依 `MANIFESTS` 宣告順序渲染 icon/name),不是另一份手寫
   清單,所以不用再多改一個檔案。真的有 app 不該出現在開始選單時,才在它
   的 manifest 加 `startMenuHidden: true`(目前沒有任何 app 需要這樣做)。
6. **給桌面入口**:`lib/os/kernel/fs.ts` 的 `seedFs()` 加一個 `.lnk`
   (`{"appId":"<id>"}`,JSON content)。
7. **驗證**:`typecheck` / `lint` / `build` 全綠,手動或 Playwright 開一次
   app、跑過至少一個核心互動路徑,確認零 console/pageerror。

## 必守規則

- **SDK-only**:app component 只 import `lib/os/sdk/*`,不 import
  `lib/os/kernel/*`。系統管理類 app(如工作管理員)例外走
  `useSystem()`,其餘 app 用 `useProcess()` / `useWindow()` / `useFs()` /
  `useDialogs()`。這條 eslint 不強制,純靠 review —— 加新 app 時自己對照
  `docs/DESIGN.md` 的 SDK hooks 契約檢查一次 import 列表。
- **對話框一律走 `useDialogs()`**:任何需要打斷使用者(確認/錯誤/選檔)的
  地方用 `msgBox` / `openFile` / `saveFile`,不用 `window.confirm` /
  `window.alert` / 自製 modal。小算盤的除以零錯誤就是示範。
- **UI copy 繁體中文**:按鈕、標題、錯誤訊息全部繁中,標點用全形(。,、
  「」)。
- **icon 慣例**:新 icon 一律從 win98icons.alexmeub.com 抓原版(帶瀏覽器
  UA),16+32 兩尺寸,命名 `public/icons/<key>-<size>.png`,`key` 進
  `IconName` 聯集。不手繪、不用其他來源的圖示混進來。
- **`.lnk` 的 `icon` 欄位覆蓋是例外,不是常態**:`.lnk` payload 預設繼承
  目標 app 的 icon;只有在同一個 app 要在不同捷徑上顯示不同 icon 時(例如
  「我的電腦」「我的文件」都開 `explorer` 但要看起來像不同東西)才加
  `icon` 欄位。單純新增一個 app 通常不需要碰這個欄位。
- **LEGACY_LNK_MAP 義務**:之後如果重新命名或移除某個 app 的 `id`,一定要
  在 `lib/os/kernel/legacy-migration.ts` 的 `LEGACY_LNK_MAP` 補一筆映射
  ——舊使用者 IndexedDB 裡的 `.lnk` 還指著舊 id,不補的話雙擊會靜默變成
  「無法開啟」。這條規則跟 app registry 異動綁在一起 review,不是可以事後
  補的 nice-to-have(見 `docs/DESIGN.md`「持久化資料相容」節)。
- **視窗尺寸量測要用實際 rem 基準**:`app/globals.css` 把 `html` 的
  `font-size` 設成 `11px`(不是瀏覽器預設的 16px),所以 Tailwind 的
  `h-8`/`gap-2` 這類 rem 單位比直覺小很多(`h-8` = 2rem = 22px,不是
  32px)。寫死 `window.width`/`window.height` 前用 Playwright 量一次實際
  render 出來的 bounding box,不要憑 16px 基準心算,否則會像小算盤第一版
  一樣多出一大塊空白(見 git 歷史)。

## 驗收 checklist

- [ ] `bun run --filter=os typecheck` 綠
- [ ] `bun run --filter=os lint` 綠(0 error)
- [ ] `bun run --filter=os build` 綠
- [ ] app 只 import `lib/os/sdk/*`,未直接碰 `lib/os/kernel/*`
- [ ] 新 icon 有 16 + 32 兩份,來源是 win98icons.alexmeub.com 原版
- [ ] 進了 registry(start menu 入口自動就有);若也要桌面捷徑,`seedFs()`
      補了對應 `.lnk`
- [ ] 視窗可正常開關、resize(若 `resizable: true`)/ 不可 resize(若
      `false`)、minimize/close 等 `controls` 宣告的行為都正常
- [ ] 對話框(若有)走 `useDialogs()`,樣式跟系統其餘 msgBox 一致
- [ ] 手動或 Playwright 跑過核心互動路徑,零 console/pageerror
- [ ] 若異動/移除了既有 app 的 `id` ——`LEGACY_LNK_MAP` 已補映射

## start menu 零額外接觸點

M4 最初把小算盤的開始選單入口做成「刻意不做」(硬限制不含
`start-menu.tsx`,它當時是一份寫死的 `MENU_ITEMS` 白名單)。這其實是規範本
身沒立好 —— 白名單讓「新增一個 app」多了第五個要碰的檔案,違反本文件開頭
講的終態。修法是**把白名單整個廢掉**:`components/start-menu.tsx` 現在直接
`Object.values(APPS).filter((app) => !app.startMenuHidden)`,选單項目 = 依
`registry.ts` 的 `MANIFESTS` 宣告順序渲染的全部 app(小算盤在內)。加一個新
app 因此完全不用碰 `start-menu.tsx`——步驟 5(註冊進 registry)那一刻,桌面
捷徑之外,開始選單入口也一併有了。
