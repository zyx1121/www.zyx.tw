# os.zyx.tw — OS 化設計文件(M1–M4)

## 終態

新增一個 app = 一個 manifest + 一個吃 SDK hooks 的 component,其餘(視窗、進程、檔案、對話框)由 OS 層供給。

```
userland   components/apps/<id>/{manifest.tsx, <id>.tsx}
              │  SDK hooks(lib/os/sdk/)
              │  useProcess · useWindow · useFs · useDialogs
kernel     lib/os/kernel/(context + reducer,無外部 state 套件)
              ProcessTable · WindowManager · VFS
persist    IndexedDB(debounced snapshot,開機 hydrate)
```

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
// context value:
{
  processes: OsProcess[]
  spawn(appId: string, args?: AppArgs): Pid   // multiInstance=false 且已存在 → focus 舊視窗、回傳舊 pid
  kill(pid: Pid): void                        // 移除 process + 其視窗(不走 onBeforeClose,是強殺)
}
```

pid 從 1 遞增。startedAt 用 Date.now()(client only)。

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
- 關閉流程:title bar X / taskbar 右鍵關閉 → 若該 pid 有註冊 onBeforeClose,先 await 它,回 true 才 kill;工作管理員的「結束工作」= 直接 kill。

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
```

hooks 由 `<AppHost pid>` 包每個 app instance 提供 context;app component 不直接 import kernel。

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
- React 端 `useFs()` 回傳穩定 API,`useFsList(dir)` / `useFsFile(path)` 以 useSyncExternalStore 訂閱。
- 回收筒 origin 記錄:`C:/Recycled/.meta` 檔存 JSON `{ [name]: originPath }`;`.` 開頭項目在所有列表 UI 隱藏。
- 重名處理:recycle/mv 撞名時自動加 ` (2)`、` (3)`。
- `.lnk` 檔:content 為 JSON `{"appId":"notepad"}`;開啟 .lnk = spawn 該 app。
- 檔案開啟規則:雙擊 file → 依副檔名查 manifest.fileAssociations → spawn(appId, {path});無關聯 → MessageBox「無法開啟」。

### 持久化(M2)

- `lib/os/kernel/idb.ts`:手寫 promise wrapper(open/get/put,單 DB `os-zyx-tw`、單 store `fs`、單 key `snapshot`),**不加任何依賴**。
- 寫入 debounce 500ms;snapshot = `{ version: 1, entries: [path, node][] }`。
- 開機 hydrate:讀到 → 載入;讀不到/壞掉 → seed。hydrate 完成前桌面顯示純 teal(M4 換開機畫面)。
- Seed:
  ```
  C:/My Documents/
  C:/Windows/Desktop/我的文件.lnk → {"appId":"my-documents"}
  C:/Windows/Desktop/記事本.lnk   → {"appId":"notepad"}
  C:/Windows/Desktop/控制台.lnk   → {"appId":"control-panel"}
  C:/Windows/Desktop/資源回收筒.lnk → {"appId":"recycle-bin"}
  C:/Windows/Desktop/README.txt   → 簡短歡迎文(繁中)
  C:/Recycled/
  ```
- 桌面 = `C:/Windows/Desktop` 的資料夾視圖(.lnk 用 app icon、.txt 用 notepad-file 類 icon;檔名去 .lnk 顯示)。

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

- 呈現:系統層級 modal 視窗(Win98 對話框樣式,置中、壓過所有視窗、遮罩不可點),不是 browser alert。
- MessageBox icon 用原版素材(msg_question / msg_warning / msg_error / msg_information family,win98icons 站抓,慣例同現有 icons)。

### 記事本(M2 改造,規範示範)

- 選單:檔案(開新檔案/開啟舊檔/儲存/另存新檔/結束)。
- title:`未命名 - 記事本` / `README.txt - 記事本`,dirty 加 `*` 前綴。
- 未儲存關閉 → onBeforeClose → msgBox yesnocancel(是=存後關,否=直接關,取消=不關)。
- args.path 存在時開檔載入。

### 檔案總管(M3)

- `explorer` app:左 tree(dir only,可折疊)+ 右 list(FolderView)+ 上方地址列(顯示 `C:\...`)+ 狀態列(N 個物件)。
- FolderView 元件共用:桌面 / 我的文件 / 回收筒 / explorer 右側 / 檔案對話框全部用它(props 控制視圖細節)。
- 右鍵選單(Win98 樣式,自寫,不用 radix ContextMenu 也行但要鍵盤可關):
  - 空白處:新增資料夾 / 新增文字文件 / 重新整理
  - 項目上:開啟 / 改名(inline input)/ 刪除(→ 回收筒;回收筒內是永久刪除)/(回收筒內)還原
- 我的文件 app 改為 explorer 開在 `C:/My Documents`(同一 component,不同初始 path)。

### 開機/關機(M4)

- 開機:每次 load 顯示 Win98 boot 畫面(黑底 logo + 底部漸層條)至 hydrate 完成,最短 1.2s。
- 關機:start menu 關機 → msgBox 樣式的關機對話框(確定要關機嗎)→ 全螢幕黑底橘字「現在可以放心關閉電腦。」,點擊任意處重新開機(reload)。
- Alt+F4 關閉 active 視窗(走 onBeforeClose)。
- APP-SPEC.md:新 app 步驟、規則、checklist(見驗收)。
- 試金石:新增「小算盤」app(calculator,原版 calc icon,基本四則),只准動 `components/apps/calculator/` + registry 一行 + seed 桌面捷徑一行,證明規範成立。

## 各期驗收(reviewer 逐條驗)

- **M1**:5 app 遷移後行為不退化;可同時開兩個記事本(multiInstance);工作管理員列出進程並能結束;視窗可 resize 且 clamp min 尺寸;app 能 setTitle;lint/typecheck/build 綠。
- **M2**:存檔→重新整理→檔案還在(IndexedDB);桌面來自 VFS;雙擊 README.txt 開記事本;記事本全選單可用;未儲存攔截三鍵行為正確;回收筒刪除/還原/清空;lint/typecheck/build 綠。
- **M3**:explorer tree/list/地址列;右鍵新增/改名/刪除/還原全通;對話框鍵盤 Esc 可關;lint/typecheck/build 綠。
- **M4**:開機/關機流程;Alt+F4;小算盤按規範加入且 diff 範圍符合限制;APP-SPEC.md 與實作一致;lint/typecheck/build 綠。

## 硬規則(所有期共用)

- house style 照舊:kebab-case、cn()、Tailwind v4 CSS-first、無新 state/dnd/idb 依賴、UI copy 繁中、Win98 token 不自創(bevel 四公式已在 globals.css)。
- kernel 檔案全在 `lib/os/kernel/`,SDK 在 `lib/os/sdk/`,app 不准 import kernel 內部(只能走 SDK)— eslint 不強制,靠 review。
- 新 icon 一律從 win98icons.alexmeub.com 抓原版(帶瀏覽器 UA),16+32 兩尺寸,命名沿用 `public/icons/<key>-<size>.png`。
- 每期單一 PR、Conventional Commits、不動其他 app 與 root 設定(bun.lock 只在真的加 dep 時變,而本設計約定不加 dep)。
