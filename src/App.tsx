import { useState, useEffect } from 'react'
import { blink } from '@/blink/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThreeViewer } from '@/components/ThreeViewer'
import { ModelGenerator, ModelGenerationOptions } from '@/utils/modelGenerator'
import * as THREE from 'three'
import { 
  Sparkles, 
  Download, 
  Settings, 
  Loader2, 
  Box, 
  Wand2,
  Images,
  FileText,
  Zap
} from 'lucide-react'

interface GeneratedModel {
  id: string
  prompt: string
  imageUrl: string
  modelUrl?: string
  model3D?: THREE.Object3D
  createdAt: Date
  status: 'generating' | 'completed' | 'failed'
}

const EXAMPLE_PROMPTS = ModelGenerator.getExamplePrompts()

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [models, setModels] = useState<GeneratedModel[]>([])
  const [activeTab, setActiveTab] = useState('generator')
  const [currentModel, setCurrentModel] = useState<THREE.Object3D | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return

    setIsGenerating(true)
    setProgress(0)

    const newModel: GeneratedModel = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      imageUrl: '',
      status: 'generating',
      createdAt: new Date()
    }

    setModels(prev => [newModel, ...prev])

    try {
      // Генерируем 3D модель
      setProgress(20)
      const generationOptions: ModelGenerationOptions = {
        complexity: 'medium',
        size: 1,
        color: '#6366f1'
      }

      setProgress(50)
      const model3D = await ModelGenerator.generateModel(prompt.trim(), generationOptions)
      
      setProgress(70)
      // Устанавливаем текущую модель для просмотра
      setCurrentModel(model3D)

      // Генерируем изображение превью с помощью AI (опционально)
      setProgress(80)
      let imageUrl = ''
      try {
        const { data } = await blink.ai.generateImage({
          prompt: `3D render of ${prompt.trim()}, high quality, professional lighting, white background, isometric view`,
          size: '1024x1024',
          quality: 'high',
          n: 1
        })
        imageUrl = data[0].url
      } catch (imageError) {
        console.warn('Не удалось сгенерировать превью изображение:', imageError)
      }

      setProgress(90)
      
      // Обновляем модель с сгенерированной 3D моделью
      setModels(prevModels => 
        prevModels.map(model => 
          model.id === newModel.id 
            ? { 
                ...model, 
                model3D, 
                imageUrl, 
                status: 'completed' as const 
              }
            : model
        )
      )

      setProgress(100)
      setPrompt('')
      
    } catch (error) {
      console.error('Ошибка генерации:', error)
      setModels(prevModels => 
        prevModels.map(model => 
          model.id === newModel.id 
            ? { ...model, status: 'failed' as const }
            : model
        )
      )
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  const handleModelClick = (model: GeneratedModel) => {
    if (model.model3D) {
      setCurrentModel(model.model3D)
      setActiveTab('generator')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto glass-effect border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Box className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Добро пожаловать!</h3>
            <p className="text-muted-foreground text-center mb-6">
              Войдите в систему, чтобы начать создавать 3D модели с помощью ИИ
            </p>
            <Button onClick={() => blink.auth.login()} className="gradient-bg">
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-2xl gradient-bg mr-4">
                <Box className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI 3D Generator
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Создавайте потрясающие 3D модели с помощью искусственного интеллекта. 
              Просто опишите что хотите - и получите готовую модель.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Генератор
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Images className="h-4 w-4" />
                Галерея
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Настройки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-8">
              {/* Generator Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                {/* Input Panel */}
                <Card className="glass-effect border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Создать 3D модель
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Опишите 3D модель, которую хотите создать..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] resize-none text-lg"
                      disabled={isGenerating}
                    />
                    
                    {/* Example Prompts */}
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Примеры запросов:</p>
                      <div className="flex flex-wrap gap-2">
                        {EXAMPLE_PROMPTS.map((example, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => handleExampleClick(example)}
                          >
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Генерация модели...</span>
                          <span className="text-primary font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="w-full h-12 text-lg gradient-bg hover:opacity-90 transition-opacity"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Генерирую модель...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Создать 3D модель
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
                </Card>

                {/* 3D Viewer Panel */}
                <Card className="glass-effect border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Box className="h-5 w-5 text-primary" />
                      3D Предпросмотр
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[500px] rounded-lg overflow-hidden">
                      {currentModel ? (
                        <ThreeViewer model={currentModel} className="w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/20">
                          <div className="text-center">
                            <Box className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              {isGenerating ? 'Генерация 3D модели...' : 'Создайте модель для предпросмотра'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              {/* Gallery Section */}
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Ваши модели</h2>
                  <Badge variant="outline" className="text-sm">
                    {models.length} {models.length === 1 ? 'модель' : 'моделей'}
                  </Badge>
                </div>

                {models.length === 0 ? (
                  <Card className="glass-effect border-border/50">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Box className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Пока нет моделей</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        Создайте свою первую 3D модель, используя генератор выше
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map((model) => (
                      <Card 
                        key={model.id} 
                        className="glass-effect border-border/50 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleModelClick(model)}
                      >
                        <div className="aspect-video relative bg-muted">
                          {model.model3D ? (
                            <div className="w-full h-full">
                              <ThreeViewer model={model.model3D} className="w-full h-full" />
                            </div>
                          ) : model.imageUrl ? (
                            <img
                              src={model.imageUrl}
                              alt={model.prompt}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Box className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          {model.status === 'generating' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                          )}
                          {model.status === 'failed' && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <p className="text-red-400 text-sm">Ошибка генерации</p>
                            </div>
                          )}
                          {model.model3D && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="text-xs">
                                3D
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {model.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={
                                model.status === 'completed' ? 'default' : 
                                model.status === 'failed' ? 'destructive' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {model.status === 'generating' ? 'Генерация...' : 
                               model.status === 'failed' ? 'Ошибка' : 'Готово'}
                            </Badge>
                            {model.status === 'completed' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // TODO: Implement download functionality
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Скачать
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Settings Section */}
              <Card className="max-w-2xl mx-auto glass-effect border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Настройки генерации
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Качество модели</h4>
                        <p className="text-sm text-muted-foreground">Высокое качество требует больше времени</p>
                      </div>
                      <Badge variant="outline">Высокое</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Формат экспорта</h4>
                        <p className="text-sm text-muted-foreground">Выберите формат для скачивания</p>
                      </div>
                      <Badge variant="outline">OBJ, STL, GLTF</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Автосохранение</h4>
                        <p className="text-sm text-muted-foreground">Сохранять модели автоматически</p>
                      </div>
                      <Badge variant="outline">Включено</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default App