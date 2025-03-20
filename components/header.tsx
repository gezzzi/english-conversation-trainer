"use client"

import { Settings } from '@/types'
import { SettingsDialog } from './settings-dialog'
import { Button } from './ui/button'
import { Menu, Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Progress } from '@/types'
import { Sparkles } from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'

interface HeaderProps {
  settings: Settings
  onSettingsChange: (settings: Settings) => void
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  progress: Progress
}

export function Header({ 
  settings, 
  onSettingsChange, 
  isSidebarOpen,
  onSidebarToggle,
  progress
}: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user } = useUser()
  
  // ハイドレーションエラーを防ぐためにクライアントサイドのみでテーマを取得
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onSidebarToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">英語会話トレーナー</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <SettingsDialog settings={settings} onSettingsChange={onSettingsChange} />
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-muted-foreground">
              {user?.firstName || user?.username}
            </span>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>
    </header>
  )
}