"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings } from '@/types'
import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
            <Label htmlFor="difficulty">返答の難易度</Label>
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