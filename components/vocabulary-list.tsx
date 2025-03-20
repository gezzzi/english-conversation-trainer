"use client"

import { useState } from 'react'
import { VocabularyWord } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  ListMusic, 
  Check, 
  BookOpen, 
  RefreshCw, 
  Trash2,
  Volume2
} from 'lucide-react'
import { useSpeech } from '@/hooks/use-speech'

interface VocabularyListProps {
  knownVocabulary: VocabularyWord[]
  studyVocabulary: VocabularyWord[]
  onAddToStudy: (word: VocabularyWord) => void
  onRemoveFromKnown: (wordId: string) => void
  onRemoveFromStudy: (wordId: string) => void
}

export function VocabularyList({
  knownVocabulary,
  studyVocabulary,
  onAddToStudy,
  onRemoveFromKnown,
  onRemoveFromStudy
}: VocabularyListProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('study')
  const { speak } = useSpeech()
  
  // 単語の発音
  const handleSpeak = (text: string) => {
    speak(text)
  }
  
  // 学習中リストに戻す
  const handleRestoreToStudy = (word: VocabularyWord) => {
    onAddToStudy(word)
    onRemoveFromKnown(word.id)
  }
  
  // レベルに応じたバッジカラー
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-400'
      case 'intermediate':
        return 'bg-yellow-400'
      case 'advanced':
        return 'bg-red-400'
      default:
        return 'bg-slate-400'
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <ListMusic className="h-4 w-4" />
          <span>単語リスト</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>単語リスト</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="study" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>学習中 ({studyVocabulary.length})</span>
            </TabsTrigger>
            <TabsTrigger value="known" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>習得済み ({knownVocabulary.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="study" className="max-h-[400px] overflow-y-auto">
            {studyVocabulary.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                学習中の単語がありません。
                <br />
                「単語を追加」から新しい単語を追加するか、単語学習を開始してください。
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>単語</TableHead>
                    <TableHead>意味</TableHead>
                    <TableHead className="w-24">レベル</TableHead>
                    <TableHead className="w-24">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studyVocabulary.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {word.word}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => handleSpeak(word.word)}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                      <TableCell>{word.definition}</TableCell>
                      <TableCell>
                        <Badge className={`${getLevelColor(word.level)} text-white`}>
                          {word.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => onRemoveFromStudy(word.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="known" className="max-h-[400px] overflow-y-auto">
            {knownVocabulary.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                習得済みの単語がありません。
                <br />
                単語学習で「知っている」と答えた単語がここに表示されます。
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>単語</TableHead>
                    <TableHead>意味</TableHead>
                    <TableHead className="w-24">レベル</TableHead>
                    <TableHead className="w-24">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {knownVocabulary.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {word.word}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => handleSpeak(word.word)}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                      <TableCell>{word.definition}</TableCell>
                      <TableCell>
                        <Badge className={`${getLevelColor(word.level)} text-white`}>
                          {word.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-amber-500"
                          onClick={() => handleRestoreToStudy(word)}
                          title="学習中に戻す"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => onRemoveFromKnown(word.id)}
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 