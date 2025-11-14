'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, FileText } from 'lucide-react'

interface ResumeAnalysisModalProps {
  open: boolean
  fileName?: string
}

export function ResumeAnalysisModal({ open, fileName }: ResumeAnalysisModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analisando Currículo
          </DialogTitle>
          <DialogDescription>
            {fileName ? `Processando ${fileName}...` : 'Processando seu currículo...'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-brown-dark">
              Estamos analisando seu currículo
            </p>
            <p className="text-xs text-brown-soft">
              Isso pode levar alguns segundos. Por favor, aguarde...
            </p>
          </div>
          <div className="w-full bg-bege-medium rounded-full h-2 overflow-hidden">
            <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

