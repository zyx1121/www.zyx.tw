# os.zyx.tw — OS 化設計文件(M1–M4)

## 終態

新增一個 app = 一個 manifest + 一個吃 SDK hooks 的 component,其餘(視窗、進程、檔案、對話框)由 OS 層供給。

```
userland   components/apps/<id>/{manifest.tsx, <id>.tsx}
              │  SDK hooks(lib/os/sdk/)
              │  useProcess · useWindow · useFs · useDialogs · useSystem
kernel     lib/os/kernel/(context + reducer,無外部 state 套件)
              ProcessTable · WindowManager · VFS · DialogManager
persist    IndexedDB(debounced snapshot,開機 hydrate)
```

app 一律只走 SDK hooks,不 import `lib/os/kernel/*`(eslint 不強制,靠
review)—— 系統管理類 app(工作管理員)走 `useSystem()`,不例外直接碰
`useProcessTable()`。

## 契約(全部 TypeScript,檔名 kebab-case)

### App manifest(M1)

```ts
// lib/os/types.ts
export type Pid = number
export interface AppArgs { path?: string }

// components/apps/<id>/manifest.tsx
export interface OsAppManifest {
  id: string                       // kebab-case,唯一
  name: string                     // 視窗預設 title + start menu 項
  description: string              // start menu 底部 status bar 顯示
  icon: IconName
  window: {
    width: number
    height: number
    minWidth?: number              // default 160
    minHeight?: number             // default 120
    resizable: boolean
    controls: WindowControl[]      // ["minimize","maximize","close"] 子集
  }
  multiInstance: boolean           // false → spawn 已存在時 focus 舊的
  fileAssociations?: string[]      // 副檔名含點:[".txt"]
  desktopHidden?: boolean          // true → 不出現在桌面(M2 起桌面由 VFS 管,此欄只影響 seed)
  Component: React.ComponentType<OsAppProps>
}
export interface OsAppProps { pid: Pid }   // 其餘一律透過 SDK hooks 取得
```

`components/apps/registry.ts` 彙整所有 manifest 成 `APPS: Record<string, OsAppManifest>`。
既有 5 app(control-panel / notepad / about / my-documents / recycle-bin)遷移到此結構,每 app 一個資料夾。

### ProcessTable(M1)

```ts
// lib/os/kernel/process-table.tsx
export interface OsProcess { pid: Pid; appId: string; args: AppArgs; startedAt: number }
// context value(正式契約,簽名不得擅改):
{
  processes: OsProcess[]
  spawn(appId: string, args?: AppArgs): Pid   // multiInstance=false 且已存在 → focus 舊視窗、回傳舊 pid
  kill(pid: Pid): void                        // 移除 process + 其視窗(不走 onBeforeClose,是強殺)
  requestClose(pid: Pid): Promise<void>       // 有註冊 onBeforeClose 就先 await 它,回 true 才 kill;否則直接 kill
  registerBeforeClose(pid: Pid, fn: (() => boolean | Promise<boolean>) | null): void
}
```

pid 從 1 遞增。startedAt 用 Date.now()(client only)。

`requestClose` / `registerBeforeClose` 是 M1 就有的實作,M2 拍板列為正式
契約(useWindow 的 `requestClose()` / `setOnBeforeClose()` 就是包這兩個)—
簽名跟既有語意都不再變動。

### WindowManager(M1 改造)

視窗 key 從 appId 改為 **pid**(v1:一 process 一主視窗)。新增:

```ts
interface OsWindow {
  pid: Pid
  appId: string
  title: string                    // 可被 app setTitle 蓋掉
  icon: IconName
  controls: WindowControl[]
  x: number; y: number; width: number; height: number
  minWidth: number; minHeight: number; resizable: boolean
  zIndex: number; minimized: boolean; maximized: boolean
  prevRect: Rect | null
}
// 新 action:SET_TITLE(pid,title) / RESIZE(pid,rect)(clamp min 尺寸與 viewport)
```

- resize:Win98 式 — 視窗四邊 + 四角 3px 熱區拖拉(pointer events 自寫),maximized 時不可 resize。
- 關閉流程:title bar X / taskbar 右鍵關閉 → 若該 pid 有註冊 onBeforeClose,先 await 它,回 true 才 kill;工作管理員的「結束工作」= 直接 kill。**M3 補上**:taskbar 視窗鈕右鍵選單(還原/最小化/最大化/關閉)本身在 M1 只有語意沒有 UI,`components/taskbar.tsx` 現在用 `components/ui/context-menu.tsx` 實際掛出來 —— 「關閉」呼叫 `requestClose`(走 onBeforeClose),不是 `kill`。

### SDK hooks(M1)

```ts
// lib/os/sdk/use-process.ts
useProcess(): { pid: Pid; args: AppArgs; exit(): void; spawn(appId: string, args?: AppArgs): Pid }
// exit() 走 onBeforeClose 流程(自己請求關閉)

// lib/os/sdk/use-window.ts
useWindow(): {
  title: string
  setTitle(t: string): void
  requestClose(): void
  setOnBeforeClose(fn: (() => boolean | Promise<boolean>) | null): void
}

// lib/os/sdk/use-system.ts(M2 補上的契約修訂)
useSystem(): { processes: OsProcess[]; kill(pid: Pid): void; spawn(appId: string, args?: AppArgs): Pid }
// 系統管理類 app(工作管理員)專用 —— 需要看到全部 process 的 app 走這個
// hook,不再例外直接 import useProcessTable。
```

hooks 由 `<AppHost pid>` 包每個 app instance 提供 context;app component 不直接 import kernel。`useFs` / `useFsList` / `useFsFile` / `useDialogs` / `useSystem` 不依賴 pid,不需要 `<AppHost>` 包裹(OS shell 本身 —— `components/desktop.tsx` —— 也可以直接呼叫)。

### VFS(M2)

```ts
// lib/os/kernel/fs.ts — flat map,path 為 key
export type FsPath = string   // 正規形式 "C:/Windows/Desktop"(內部斜線;UI 顯示反斜線)
export type FsNode =
  | { type: "file"; content: string; mtime: number }
  | { type: "dir"; mtime: number }

export interface Vfs {
  exists(p: FsPath): boolean
  stat(p: FsPath): FsNode | null
  list(dir: FsPath): { name: string; node: FsNode }[]   // 按 dir 先、再字典序
  readFile(p: FsPath): string | null
  writeFile(p: FsPath, content: string): void            // 父目錄不存在 → throw
  mkdir(p: FsPath): void                                  // 遞迴建立
  rm(p: FsPath): void                                     // 硬刪(dir 含遞迴);回收流程見下
  mv(from: FsPath, to: FsPath): void                      // dir 時搬整個 prefix
  recycle(p: FsPath): void                                // 搬進 C:/Recycled + 記 origin
  restore(name: string): void                             // 從回收筒還原到 origin
  emptyRecycleBin(): void
  subscribe(listener: () => void): () => void             // useSyncExternalStore 用
}
```

- 實作:`Map<FsPath, FsNode>` + 版本號;所有寫入 bump 版本、通知 subscriber。
- React 端 `useFs()` 回傳穩定 API,`useFsList(dir)` / `useFsFile(path)` 以 useSyncExternalStore 訂閱 —— 三者定義在 `lib/os/kernel/fs.ts`,經 `lib/os/sdk/use-fs.ts` re-export 給 app 用(app 只 import sdk 那份)。
- 回收筒 origin 記錄:`C:/Recycled/.meta` 檔存 JSON `{ [name]: originPath }`;`.` 開頭項目在所有列表 UI 隱藏。
- 重名處理:recycle/mv 撞名時自動加 ` (2)`、` (3)`。
- `.lnk` 檔:content 為 JSON `{"appId":"notepad"}`,可選 `args`(如
  `{"appId":"explorer","args":{"path":"C:/My Documents"}}`);開啟 .lnk =
  spawn 該 app(帶上 args,M3 起支援)。
- 檔案開啟規則:雙擊 file → 依副檔名查 manifest.fileAssociations → spawn(appId, {path});無關聯 → MessageBox「無法開啟」。判斷邏輯是純函式 `resolveOpenTarget(vfs, apps, path)`(`lib/os/sdk/open-target.ts`),吃 vfs/apps 當參數而不 import registry,避免 registry → manifest → app component → sdk → open-target → registry 的 import 環。桌面 / 我的文件 / 回收筒都共用它。
- `Vfs` 介面本身不含持久化方法;`dumpFsEntries()` / `loadFsEntries()` / `seedFs()` / `getFsVersion()` 是 fs.ts 額外 export 的 kernel-only 函式,只給 `idb.ts` 用,不進 app 可見的契約。
- **M2 已實作**(2026-07):`lib/os/kernel/fs.ts`。

**M1 遺留 bug 順手修的一件事**:`WindowManager` reducer 的 `SET_TITLE` 原本每次都回傳新的 `windows` 陣列,即使 title 沒變 —— app 若在 `useEffect` 裡呼叫 `setTitle`(記事本的 dirty `*` 前綴就是這樣做)會導致 context value 每次都重建、SDK closure 跟著換身分、effect 依賴陣列判定「變了」再度觸發,形成無限迴圈。現在 `SET_TITLE` 對 no-op 寫入直接回傳原 state,不觸發下游重渲染。之後任何會被放進 `useEffect` deps 的 kernel action,都要照這個模式先檢查是否真的變了。

### 持久化(M2)

- `lib/os/kernel/idb.ts`:手寫 promise wrapper(open/get/put,單 DB `os-zyx-tw`、單 store `fs`、單 key `snapshot`),**不加任何依賴**。
- 寫入 debounce 500ms;snapshot = `{ version: 1, entries: [path, node][] }`。
- 開機 hydrate:讀到 → 載入;讀不到/壞掉 → seed。hydrate 完成前桌面顯示純 teal(M4 換開機畫面)。
- Seed:
  ```
  C:/My Documents/
  C:/Windows/Desktop/我的文件.lnk → {"appId":"explorer","args":{"path":"C:/My Documents"}}
  C:/Windows/Desktop/記事本.lnk   → {"appId":"notepad"}
  C:/Windows/Desktop/控制台.lnk   → {"appId":"control-panel"}
  C:/Windows/Desktop/資源回收筒.lnk → {"appId":"recycle-bin"}
  C:/Windows/Desktop/README.txt   → 簡短歡迎文(繁中)
  C:/Recycled/
  ```
- 桌面 = `C:/Windows/Desktop` 的資料夾視圖(.lnk 用 app icon、.txt 用 notepad-file 類 icon;檔名去 .lnk 顯示)。
- Dev-only 測試鉤子:`components/desktop.tsx` 在 hydrate 完成後,若 `process.env.NODE_ENV !== "production"` 就把 `window.__osfs = vfs`(Next 建置時會連同判斷式一起 dead-code-eliminate,production bundle 不含 —— 已用 `next build` 產物 grep 驗證);Playwright 驗證腳本(`scratchpad/m2-verify.mjs`)靠它直接呼叫 recycle/restore/emptyRecycleBin,不用等 M3 explorer 才有刪除入口。
- **M2 已實作**(2026-07):`lib/os/kernel/idb.ts`。

### 持久化資料相容(M3 補上)

真實使用者的 IndexedDB 快照是跨版本累積的 —— 它不會因為某個 app id 被
改名/移除就自動更新。M2 的 seed 把「我的文件」寫成 `{"appId":"my-documents"}`;
M3 拿掉 `my-documents` manifest 改成 `explorer` 後,**舊快照裡的 `.lnk` 還是
指著已經不存在的 appId**,`resolveOpenTarget()` 查不到 → 雙擊跳「無法開啟」,
不是 crash 但對回訪使用者是可見的功能倒退。

- `lib/os/kernel/legacy-migration.ts`:`LEGACY_LNK_MAP`(`Record<舊 appId,
新 payload>`)+ `migrateLegacyLnks(entries)`,對 `.lnk` 檔案逐一比對、命中
  才改寫 `content`,冪等(改過一次的 entry 新 appId 不在 map 裡,再跑一次
  是 no-op)。
- 套用時機:`idb.ts` 的 `hydrateFs()` 讀到合法 snapshot 後、**丟進
  `loadFsEntries()` 掛上 store 之前**先跑過 `migrateLegacyLnks`——修的是資料
  本身,不是在 `resolveOpenTarget()` 查詢時繞過去(繞過去的話每次雙擊都要
  重新判斷一次,且下次存檔又把舊 payload 寫回去,問題不會消失)。
- **硬規則**:之後任何一次移除或改名 app id(如 M3 的
  `my-documents` → `explorer`),都必須在 `LEGACY_LNK_MAP` 補一筆映射,
  否則舊使用者的捷徑會靜默失效。這條規則跟 app 本身的 registry 異動綁在
  一起 review,不是可以事後補的 nice-to-have。
- `resolveOpenTarget()` 本身不用改:查無 appId(遷移表也接不住的情況,例如
  純粹損毀的 payload)本來就該落回「無法開啟」的既有路徑。
- 驗證:`scratchpad/m3-verify.mjs` 收了一個**不清空 IndexedDB**的永久
  case——手動灌一筆 M2 格式快照(`{"appId":"my-documents"}`)、reload、雙擊
  「我的文件」、斷言開出來的是 explorer 且位址列是 `C:\My Documents`。這條
  之後每期都要留著跑,不能被「每次都先清庫重 seed」的其他測試蓋過去。
- **M3 已實作**(2026-07):`lib/os/kernel/legacy-migration.ts`。

### 系統對話框(M2 基本版,M3 完善)

```ts
// lib/os/sdk/use-dialogs.ts — 由 DialogProvider(kernel 層)實作
useDialogs(): {
  msgBox(o: { title: string; message: string; icon?: "info"|"warning"|"error"|"question";
              buttons?: "ok"|"okcancel"|"yesno"|"yesnocancel" }): Promise<"ok"|"cancel"|"yes"|"no">
  openFile(o?: { startDir?: FsPath; extensions?: string[] }): Promise<FsPath | null>
  saveFile(o?: { startDir?: FsPath; defaultName?: string; extension?: string }): Promise<FsPath | null>
}
```

- 呈現:系統層級 modal 視窗(Win98 對話框樣式,置中、壓過所有視窗),不是
  browser alert。**M3 修訂**:遮罩不調光 —— 真 Win98 modal 不會把背景變暗,
  `SystemDialogHost` 的遮罩改成純透明的 click-blocker(仍擋互動、Esc 可關)。
- MessageBox icon 用原版素材(msg_question / msg_warning / msg_error / msg_information family,win98icons 站抓,慣例同現有 icons)。
- 實作:`DialogProvider`(`lib/os/kernel/dialog-manager.tsx`)維護一個 request 佇列,同一時間只渲染最前面那個(Win98 msgbox 本來就是嚴格 modal,不疊窗);視覺元件在 `components/system-dialogs.tsx`(`MessageBoxDialog` / `FileDialog`),跟 `Window` 共用同一組 bevel token 但無 drag/resize。Esc = 觸發 dismiss 結果(有 cancel 給 cancel,否則 yesno 給 no,ok 就是 ok);`FileDialog` 的非法檔名錯誤是疊在檔案對話框之上的第二層 `MessageBoxDialog`,Esc 先關這層,再關到底層對話框 —— 層級判斷靠 `nameError` state,不是佇列。
- `openFile` / `saveFile`(**M3 完善**):清單改用共用的 `FolderView`(見下,`readOnly` + `filter` 依副檔名篩選 + `mode="list"`);`..` 合成列拿掉,改成路徑列旁一顆「上一層」按鈕(跟 explorer 同款)。仍沒有多選。
- **M2 已實作**(2026-07,基本版):`lib/os/kernel/dialog-manager.tsx` + `components/system-dialogs.tsx`。**M3 完善**(2026-07):去調光 + FolderView 化。

### 記事本(M2 改造,規範示範)

- 選單:檔案(開新檔案/開啟舊檔/儲存/另存新檔/結束)。
- title:`未命名 - 記事本` / `README.txt - 記事本`,dirty 加 `*` 前綴。
- 未儲存關閉 → onBeforeClose → msgBox yesnocancel(是=存後關,否=直接關,取消=不關)。
- args.path 存在時開檔載入。
- 「開新檔案」「開啟舊檔」在 dirty 狀態下也先跑同一套 yesnocancel 確認(跟關閉共用 `confirmDiscard()`),不只有視窗關閉才防丟資料。
- **M2 已實作**(2026-07):`components/apps/notepad/notepad.tsx`。

### 檔案總管(M3)

```ts
// components/folder-view.tsx — 契約(簽名不得擅改)
export interface FolderViewProps {
  dir: FsPath
  mode?: "icon" | "list"                          // default "icon"
  columns?: ("size" | "type" | "modified")[]      // list mode 額外欄位
  filter?: (entry: FsEntry) => boolean            // 目錄一律通過,只篩檔案
  onActivate?: (info: FolderViewActivation) => void        // 雙擊/Enter
  onSelectionChange?: (info: FolderViewActivation | null) => void
  recycleBin?: boolean   // 項目選單變 還原/永久刪除;空白選單拿掉新增動作
  readOnly?: boolean     // 檔案對話框用:純瀏覽,無右鍵選單
  emptyMessage?: string
  className?: string
}
export interface FolderViewActivation { name: string; path: FsPath; node: FsNode }
```

- `explorer` app(`components/apps/explorer/`):左 tree(`tree.tsx`,dir only、可折疊、[+]/[-] 方框切換,不是圖示切換)+ 右 `FolderView`(`mode="list"`,`columns=["size","type","modified"]`)+ 上方地址列(顯示 `C:\...`,Enter 導航、無效路徑跳 msgBox)+「上一層」按鈕 + 狀態列(N 個物件,自己另外訂閱 `useFsList` 算數,不靠 FolderView 回拋)。視窗標題不是固定的「檔案總管」,是當前資料夾名稱(`basenamePath`,根目錄顯示「本機磁碟 (C:)」)——真 Explorer 也是這樣,標題跟著導航變。
- `FolderView` 是唯一實作,五處共用:桌面(`mode="icon"`,絕對定位鋪滿整個桌面 —— 空白處右鍵/單擊清除選取因此涵蓋全螢幕,不只圖示那一小塊)、回收筒(`mode="list" recycleBin`)、explorer 右側、`FileDialog` 的瀏覽清單(`mode="list" readOnly`)。**我的文件已不是獨立 app** —— 桌面的「我的文件.lnk」現在 spawn `explorer` app、`args.path` 指向 `C:/My Documents`(同一 component,靠 `.lnk` payload 帶的 args 給不同初始路徑;`resolveOpenTarget` M3 起把 `.lnk` 的 `args` 欄位一併傳出)。
- 建立/改名/刪除全部是 `FolderView` 內部狀態機(`useFs()` 直接操作 vfs,不外洩到呼叫端):
  - 新增資料夾/新增文字文件:`uniqueNameIn(vfs, dir, base)`(`fs.ts` 新 export,沿用 recycle() 那套 `(2)`/`(3)` 撞名規則)取名 → mkdir/writeFile → 立刻進 inline 改名(Win98 行為)。
  - 改名:F2 或右鍵「改名」→ inline `<Input>`(取代該列的按鈕,不是嵌在 button 裡 —— button 包 input 是無效巢狀互動元件);Enter/blur 提交,Escape 取消;非法字元或撞名 → `msgBox` 錯誤、還原原名不改(`ILLEGAL_NAME_CHARS`/`ILLEGAL_NAME_MESSAGE` 從 `fs.ts` 匯出,`FileDialog` 的 Save As 驗證也共用同一份,不再各自定義)。
  - 刪除(一般資料夾):`vfs.recycle()`。刪除(回收筒內,選單文字是「永久刪除」):`msgBox` yesno 確認 → `vfs.rm()` + 順手清 `C:/Recycled/.meta` 對應的那一筆(`.meta` 是 DESIGN.md 記載的公開檔案格式,不是私有實作細節,FolderView 可以直接讀寫它)。回收筒內「還原」= `vfs.restore(name)`。
- 右鍵選單(`components/ui/context-menu.tsx`,自寫、非 radix):silver `bevel-raised` 面板,項目 hover/鍵盤 focus 都是 navy 反白,分隔線用跟 `MenuBarSeparator` 一樣的雙 border 公式。Esc / 點外 / 選完自動關閉;方向鍵上下移動 focus(跳過分隔線與 disabled 項)、Enter 觸發。掛載點:
  - 空白處(桌面/資料夾):新增資料夾 / 新增文字文件 / 重新整理(重新整理是 no-op —— 清單已經是 `useSyncExternalStore` 即時訂閱,不需要手動刷新,選單留這一項只是保留使用者習慣的入口)
  - 項目上:開啟 / 改名 / 刪除;回收筒內是 還原 / 永久刪除
  - taskbar 視窗鈕:還原 / 最小化 / 最大化 / 關閉(見上面 WindowManager 段落)
- **M3 已實作**(2026-07):`components/folder-view.tsx`、`components/ui/context-menu.tsx`、`components/apps/explorer/{manifest.tsx,explorer.tsx,tree.tsx}`。`components/desktop-icon.tsx` 與 `components/apps/my-documents/` 已刪除(併入 FolderView / explorer)。

### 開機/關機(M4)

- 開機:每次 load 顯示 Win98 boot 畫面(黑底 logo + 底部漸層條)至 hydrate 完成,最短 1.2s。
- 關機:start menu 關機 → msgBox 樣式的關機對話框(確定要關機嗎)→ 全螢幕黑底橘字「現在可以放心關閉電腦。」,點擊任意處重新開機(reload)。
- Alt+F4 關閉 active 視窗(走 onBeforeClose)。
- APP-SPEC.md:新 app 步驟、規則、checklist(見驗收)。
- 試金石:新增「小算盤」app(calculator,原版 calc icon,基本四則),只准動 `components/apps/calculator/` + registry 一行 + seed 桌面捷徑一行,證明規範成立。

## 各期驗收(reviewer 逐條驗)

- **M1**:5 app 遷移後行為不退化;可同時開兩個記事本(multiInstance);工作管理員列出進程並能結束;視窗可 resize 且 clamp min 尺寸;app 能 setTitle;lint/typecheck/build 綠。
- **M2**:存檔→重新整理→檔案還在(IndexedDB);桌面來自 VFS;雙擊 README.txt 開記事本;記事本全選單可用;未儲存攔截三鍵行為正確;回收筒還原/清空(UI)+ recycle(M2 無刪除入口,走 fs API/dev hook 驗證,刪除 UI 是 M3 explorer 右鍵選單);lint/typecheck/build 綠。
- **M3**:explorer tree/list/地址列;右鍵新增/改名/刪除/還原全通;對話框鍵盤 Esc 可關;lint/typecheck/build 綠。
- **M4**:開機/關機流程;Alt+F4;小算盤按規範加入且 diff 範圍符合限制;APP-SPEC.md 與實作一致;lint/typecheck/build 綠。

## 硬規則(所有期共用)

- house style 照舊:kebab-case、cn()、Tailwind v4 CSS-first、無新 state/dnd/idb 依賴、UI copy 繁中、Win98 token 不自創(bevel 四公式已在 globals.css)。
- kernel 檔案全在 `lib/os/kernel/`,SDK 在 `lib/os/sdk/`,app 不准 import kernel 內部(只能走 SDK)— eslint 不強制,靠 review。
- 新 icon 一律從 win98icons.alexmeub.com 抓原版(帶瀏覽器 UA),16+32 兩尺寸,命名沿用 `public/icons/<key>-<size>.png`。
- 每期單一 PR、Conventional Commits、不動其他 app 與 root 設定(bun.lock 只在真的加 dep 時變,而本設計約定不加 dep)。
