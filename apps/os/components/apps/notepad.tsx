"use client"

import * as React from "react"

import {
  MenuBar,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarSeparator,
  MenuBarTrigger,
} from "@/components/ui/menu-bar"
import type { AppContentProps } from "@/components/apps/registry"

const PLACEHOLDER = `這是記事本的 sunken textarea。

試著打幾個字、拖拉視窗、或從「檔案」選單按下「關閉」。`

export function NotepadApp({ onClose }: AppContentProps) {
  return (
    <div className="-m-2 flex flex-1 flex-col gap-0">
      <MenuBar>
        <MenuBarMenu>
          <MenuBarTrigger>檔案</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem disabled>開新檔案</MenuBarItem>
            <MenuBarItem disabled>開啟舊檔...</MenuBarItem>
            <MenuBarItem disabled>儲存</MenuBarItem>
            <MenuBarSeparator />
            <MenuBarItem onSelect={onClose}>關閉</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu>
          <MenuBarTrigger>編輯</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem disabled>復原</MenuBarItem>
            <MenuBarItem disabled>剪下</MenuBarItem>
            <MenuBarItem disabled>複製</MenuBarItem>
            <MenuBarItem disabled>貼上</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu>
          <MenuBarTrigger>說明</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem disabled>關於記事本</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
      </MenuBar>
      <textarea
        className="bevel-sunken win98-focusable m-2 flex-1 resize-none p-1 text-win98-text"
        defaultValue={PLACEHOLDER}
        spellCheck={false}
      />
    </div>
  )
}
