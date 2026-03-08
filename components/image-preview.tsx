'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Eye, Maximize2 } from 'lucide-react'

interface ImagePreviewProps {
  imageUrl: string | null
}

export function ImagePreview({ imageUrl }: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!imageUrl) {
    return (
      <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            原图参考
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">请先选择图片</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          原图参考
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg p-2">
            <img
              src={imageUrl}
              alt="原图"
              className="w-full h-auto rounded-lg"
              crossOrigin="anonymous"
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="aspect-square rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="原图"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      </CardContent>
    </Card>
  )
}
