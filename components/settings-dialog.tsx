"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings } from '@/types'
import { Settings2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SettingsDialogProps {
  settings: Settings
  onSettingsChange: (settings: Settings) => void
}

export function SettingsDialog({ settings, onSettingsChange }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="difficulty">返答の難易度</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-2 max-w-xs">
                      <p><strong>初級:</strong> 基本的な日常会話と簡単な表現に焦点を当てます。</p>
                      <p><strong>中級:</strong> より複雑な文法と表現、様々な状況での会話練習。</p>
                      <p><strong>上級:</strong> 自然な会話の流れ、イディオム、ビジネス英語など。</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={localSettings.difficulty}
              onValueChange={(value: any) => handleChange('difficulty', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="返答の難易度を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">初級</SelectItem>
                <SelectItem value="intermediate">中級</SelectItem>
                <SelectItem value="advanced">上級</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="autoSpeak">自動読み上げ</Label>
            <Switch
              id="autoSpeak"
              checked={localSettings.autoSpeak}
              onCheckedChange={(checked) => handleChange('autoSpeak', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showTranslation">翻訳を表示</Label>
            <Switch
              id="showTranslation"
              checked={localSettings.showTranslation}
              onCheckedChange={(checked) => handleChange('showTranslation', checked)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}