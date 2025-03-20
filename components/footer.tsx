"use client"

import { Github, Twitter } from 'lucide-react'
import { Button } from './ui/button'

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            © 2025 English Conversation Trainer. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}