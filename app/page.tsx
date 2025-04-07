"use client"

import { useState, useEffect, useRef } from 'react'
import { ChatContainer } from '@/components/chat-container'
import { ChatInput } from '@/components/chat-input'
import { SettingsDialog } from '@/components/settings-dialog'
import { ProgressCard } from '@/components/progress-card'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Message, Settings, Progress, VocabularyWord } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { generateConversationResponse, translateJapaneseToEnglish } from '@/lib/gemini'
import { getConversationManager } from '@/lib/gemini'
import { SpeechManager } from '@/lib/speech'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { getUserProgress, updateUserProgress, getUserVocabulary, addVocabularyWord, removeVocabularyWord, getUserMessages, saveUserMessages } from '@/lib/supabase'

const DEFAULT_SETTINGS: Settings = {
  difficulty: 'beginner',
  autoSpeak: true,
  showTranslation: true,
}

const DEFAULT_PROGRESS: Progress = {
  totalMessages: 0,
  correctSentences: 0,
  vocabularyLearned: 0,
  lastPracticed: new Date().toISOString(),
  streak: 0,
  level: 1,
  experience: 0,
  knownVocabulary: [],
  studyVocabulary: []
}

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true)
  const speechManager = useRef<SpeechManager | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    // ユーザーデータの読み込み
    async function loadUserData() {
      if (!user) return

      // 進捗データの取得
      const userProgress = await getUserProgress(user.id)
      if (userProgress) {
        // Supabaseから取得したデータをアプリの状態に変換
        const knownVocabulary = await getUserVocabulary(user.id)
        
        setProgress({
          totalMessages: userProgress.total_messages,
          correctSentences: userProgress.correct_sentences,
          vocabularyLearned: userProgress.vocabulary_learned,
          lastPracticed: userProgress.last_practiced || new Date().toISOString(),
          streak: userProgress.streak,
          level: userProgress.level,
          experience: userProgress.experience,
          knownVocabulary: knownVocabulary.filter(word => word.mastered).map(word => ({
            id: word.id,
            word: word.word,
            translation: word.translation,
            example: word.example,
          })),
          studyVocabulary: knownVocabulary.filter(word => !word.mastered).map(word => ({
            id: word.id,
            word: word.word,
            translation: word.translation,
            example: word.example,
          }))
        });
      } else {
        // 新規ユーザーの場合、デフォルト値で進捗を初期化
        await updateUserProgress(user.id, {
          total_messages: DEFAULT_PROGRESS.totalMessages,
          correct_sentences: DEFAULT_PROGRESS.correctSentences,
          vocabulary_learned: DEFAULT_PROGRESS.vocabularyLearned,
          last_practiced: DEFAULT_PROGRESS.lastPracticed,
          streak: DEFAULT_PROGRESS.streak,
          level: DEFAULT_PROGRESS.level,
          experience: DEFAULT_PROGRESS.experience,
        });
      }

      // メッセージ履歴の取得
      const userMessages = await getUserMessages(user.id)
      if (userMessages && userMessages.length > 0) {
        setMessages(userMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          type: msg.type,
          translation: msg.translation || undefined,
          correction: msg.correction || undefined,
        })));
      } else {
        // 初期メッセージを設定
        const initialMessage: Message = {
          id: uuidv4(),
          content: "Hello! I'm your English conversation partner. What would you like to talk about today?",
          type: 'bot',
        };
        setMessages([initialMessage]);
        await saveUserMessages(user.id, [initialMessage]);
      }
    }

    loadUserData();

    if (typeof window !== 'undefined') {
      speechManager.current = SpeechManager.getInstance()
    }
  }, [isLoaded, isSignedIn, router, user])

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages))
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    setIsLoading(true);
    
    if (speechManager.current) {
      speechManager.current.stop()
    }
    
    const userMessageId = uuidv4();
    const userMessage: Message = {
      id: userMessageId,
      content,
      type: 'user',
    }
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const [translation, response] = await Promise.all([
        translateJapaneseToEnglish(content),
        generateConversationResponse(content, settings)
      ]);

      // Update user message with translation
      const updatedUserMessage = {
        ...userMessage,
        translation: translation
      };
      
      const botMessage: Message = {
        id: uuidv4(),
        content: response.response,
        type: 'bot',
        translation: response.translation,
        correction: response.corrections
      }

      const updatedMessagesWithBot = [
        ...messages,
        updatedUserMessage,
        botMessage
      ];
      setMessages(updatedMessagesWithBot);
      
      if (autoSpeak && speechManager.current) {
        speechManager.current.speak(response.response)
      }

      // メッセージをSupabaseに保存
      if (user) {
        await saveUserMessages(user.id, updatedMessagesWithBot);
        
        // 進捗を更新
        const updatedProgress = {
          ...progress,
          totalMessages: progress.totalMessages + 1,
          correctSentences: progress.correctSentences + (response.corrections ? 1 : 0),
          vocabularyLearned: progress.vocabularyLearned + (response.corrections ? response.corrections.length : 0),
          lastPracticed: new Date().toISOString(),
          streak: response.corrections ? progress.streak + 1 : 0,
          level: Math.floor(progress.experience / 100) + 1,
          experience: progress.experience + 10 + (response.corrections ? response.corrections.length * 2 : 0),
        };
        
        handleUpdateProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Failed to generate response:', error)
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'Sorry, I encountered an error processing your message.',
        type: 'bot',
        translation: '申し訳ありませんが、メッセージの処理中にエラーが発生しました。'
      }
      const updatedMessagesWithError = [...updatedMessages, errorMessage];
      setMessages(updatedMessagesWithError);
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings)
    setAutoSpeak(newSettings.autoSpeak)
    localStorage.setItem('settings', JSON.stringify(newSettings))
  }

  // 単語学習完了時のハンドラ
  const handleVocabularyStudyComplete = (studiedWords: VocabularyWord[]) => {
    // 知っている単語リストを更新
    setProgress(prev => {
      // 既存の知っている単語リストを取得
      const existingKnownWords = prev.knownVocabulary || [];
      
      // 新しく追加された単語IDのリスト
      const newWordIds = studiedWords.map(word => word.id);
      
      // 既存のリストから重複を除外
      const filteredExistingWords = existingKnownWords.filter(
        word => !newWordIds.includes(word.id)
      );
      
      // 学習中の単語リストから知っている単語を除外
      const updatedStudyVocabulary = prev.studyVocabulary.filter(
        word => !newWordIds.includes(word.id)
      );
      
      // 知っている単語として追加
      const updatedKnownVocabulary = [
        ...filteredExistingWords,
        ...studiedWords
      ];
      
      // 新しく学習した単語ごとに経験値を加算（1単語あたり5 XP）
      const experienceGain = studiedWords.length * 5;
      const newExperience = prev.experience + experienceGain;
      const newLevel = Math.floor(newExperience / 100) + 1;
      
      return {
        ...prev,
        vocabularyLearned: updatedKnownVocabulary.length,
        knownVocabulary: updatedKnownVocabulary,
        studyVocabulary: updatedStudyVocabulary,
        experience: newExperience,
        level: newLevel
      };
    });
  }
  
  // 単語をリストに追加
  const handleAddWord = async (word: VocabularyWord) => {
    if (!user) return;
    
    // Supabaseに単語を追加
    const success = await addVocabularyWord(user.id, {
      word: word.word,
      translation: word.translation,
      example: word.example || '',
      mastered: false,
    });
    
    if (success) {
      const updatedProgress = {
        ...progress,
        studyVocabulary: [...progress.studyVocabulary, word],
      };
      setProgress(updatedProgress);
    }
  }
  
  // 単語をリストから削除
  const handleRemoveWord = async (wordId: string) => {
    if (!user) return;
    
    // Supabaseから単語を削除
    const success = await removeVocabularyWord(user.id, wordId);
    
    if (success) {
      const updatedProgress = {
        ...progress,
        knownVocabulary: progress.knownVocabulary.filter(w => w.id !== wordId),
        studyVocabulary: progress.studyVocabulary.filter(w => w.id !== wordId),
      };
      setProgress(updatedProgress);
    }
  }
  
  // 進捗を部分的に更新
  const handleUpdateProgress = (newProgress: Partial<Progress>) => {
    const updatedProgress = { ...progress, ...newProgress };
    setProgress(updatedProgress);
    
    if (user) {
      // Supabaseに進捗を保存
      updateUserProgress(user.id, {
        total_messages: updatedProgress.totalMessages,
        correct_sentences: updatedProgress.correctSentences,
        vocabulary_learned: updatedProgress.vocabularyLearned,
        last_practiced: updatedProgress.lastPracticed,
        streak: updatedProgress.streak,
        level: updatedProgress.level,
        experience: updatedProgress.experience,
      });
    }
  }

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        progress={progress}
        onVocabularyStudyComplete={handleVocabularyStudyComplete}
        onAddWord={handleAddWord}
        onRemoveWord={handleRemoveWord}
        onUpdateProgress={handleUpdateProgress}
      />
      
      <div className="flex-1 flex flex-col h-screen">
        <Header 
          settings={settings} 
          onSettingsChange={handleSettingsChange}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          progress={progress}
        />
        
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 container mx-auto p-4 flex flex-col overflow-hidden"
        >
          <Card className="flex-1 flex flex-col overflow-hidden">
            <ChatContainer 
              messages={messages}
              showTranslation={settings.showTranslation}
            />
            <ChatInput 
              onSend={handleSendMessage} 
              isLoading={isLoading} 
              progress={progress}
            />
          </Card>
        </motion.main>
        
        <Footer />
      </div>
    </div>
  )
}