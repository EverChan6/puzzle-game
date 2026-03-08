'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PRESET_IMAGES, type PresetImage } from '@/lib/puzzle-types'
import { Upload, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageSelectorProps {
  onSelect: (imageUrl: string) => void
  selectedUrl: string | null
}

export function ImageSelector({ onSelect, selectedUrl }: ImageSelectorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setUploadedImage(dataUrl)
      onSelect(dataUrl)
    }
    reader.readAsDataURL(file)
  }, [onSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handlePresetSelect = (preset: PresetImage) => {
    setUploadedImage(null)
    onSelect(preset.url)
  }

  const clearUploadedImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          选择图片
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 上传区域 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
            isDragging 
              ? "border-primary bg-primary/10" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          
          {uploadedImage ? (
            <div className="relative inline-block">
              <img
                src={uploadedImage}
                alt="已上传"
                className="w-24 h-24 object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  clearUploadedImage()
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                点击或拖拽图片到此处上传
              </p>
              <p className="text-xs text-muted-foreground/70">
                支持 JPG、PNG、WebP 格式
              </p>
            </div>
          )}
        </div>

        {/* 分隔线 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">或选择预设图片</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* 预设图库 */}
        <div className="grid grid-cols-3 gap-2">
          {PRESET_IMAGES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden transition-all duration-200",
                "ring-2 ring-offset-2 ring-offset-background",
                selectedUrl === preset.url
                  ? "ring-primary scale-105"
                  : "ring-transparent hover:ring-primary/50"
              )}
            >
              <img
                src={preset.thumbnail}
                alt={preset.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                <span className="text-xs text-white truncate block">
                  {preset.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
