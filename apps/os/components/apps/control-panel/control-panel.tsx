"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Fieldset, FieldsetLegend } from "@/components/ui/fieldset"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ControlPanelApp() {
  const [volume, setVolume] = React.useState(65)

  return (
    <Tabs defaultValue="controls" className="flex-1">
      <TabsList>
        <TabsTrigger value="appearance">外觀</TabsTrigger>
        <TabsTrigger value="controls">控制項展示</TabsTrigger>
      </TabsList>

      <TabsContent value="appearance" className="flex flex-col gap-3">
        <Fieldset>
          <FieldsetLegend>桌面設定</FieldsetLegend>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2">
              <span className="w-20 shrink-0">配色方案</span>
              <Select defaultValue="classic">
                <SelectTrigger className="max-w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Windows 標準</SelectItem>
                  <SelectItem value="desert">大地色系</SelectItem>
                  <SelectItem value="vivid">活力色系</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <div className="flex items-center gap-2">
              <Checkbox id="icon-shadow" defaultChecked />
              <label htmlFor="icon-shadow">顯示桌面圖示的陰影</label>
            </div>
          </div>
        </Fieldset>
      </TabsContent>

      <TabsContent value="controls">
        <Fieldset>
          <FieldsetLegend>表單控件展示</FieldsetLegend>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button>一般按鈕</Button>
              <Button tone="default">預設按鈕</Button>
              <Button disabled>停用按鈕</Button>
            </div>

            <label className="flex items-center gap-2">
              <span className="w-20 shrink-0">輸入框</span>
              <Input defaultValue="Hello, Win98" className="max-w-48" />
            </label>

            <label className="flex items-center gap-2">
              <span className="w-20 shrink-0">下拉選單</span>
              <Select defaultValue="b">
                <SelectTrigger className="max-w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">選項 A</SelectItem>
                  <SelectItem value="b">選項 B</SelectItem>
                  <SelectItem value="c">選項 C</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <div className="flex items-center gap-2">
              <Checkbox id="checkbox-demo" defaultChecked />
              <label htmlFor="checkbox-demo">核取方塊</label>
            </div>

            <RadioGroup defaultValue="1" className="flex-row gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="1" id="radio-1" />
                <label htmlFor="radio-1">選項一</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="2" id="radio-2" />
                <label htmlFor="radio-2">選項二</label>
              </div>
            </RadioGroup>

            <label className="flex items-center gap-2">
              <span className="w-20 shrink-0">滑桿</span>
              <Slider
                className="max-w-48"
                value={[volume]}
                max={100}
                step={1}
                onValueChange={([v]) => setVolume(v ?? volume)}
              />
            </label>

            <label className="flex items-center gap-2">
              <span className="w-20 shrink-0">進度條</span>
              <Progress value={volume} className="max-w-48" />
            </label>
          </div>
        </Fieldset>
      </TabsContent>
    </Tabs>
  )
}
