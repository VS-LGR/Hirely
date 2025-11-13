'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface ResumeAnalysis {
  skills: string[]
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate?: string
    description?: string
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string
  }>
  bio?: string
  suggestedTags: Array<{ name: string; category: string }>
  strengths: string[]
  suggestions: string[]
}

interface ResumeUploadProps {
  onAnalysisComplete: (analysis: ResumeAnalysis) => void
}

export function ResumeUpload({ onAnalysisComplete }: ResumeUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await api.post('/ai/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data.analysis as ResumeAnalysis
    },
    onSuccess: (analysis) => {
      onAnalysisComplete(analysis)
      setSelectedFile(null)
      setError('')
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Erro ao fazer upload do currículo'
      
      // Mensagens mais amigáveis para erros específicos
      if (errorMessage.includes('quota') || errorMessage.includes('cota')) {
        setError('Cota da API OpenAI excedida. Por favor, verifique seu plano e detalhes de cobrança na OpenAI.')
      } else if (errorMessage.includes('API key') || errorMessage.includes('chave')) {
        setError('Chave da API OpenAI não configurada ou inválida.')
      } else {
        setError(errorMessage)
      }
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Tamanho máximo: 5MB')
        return
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setError('Apenas arquivos PDF e DOCX são permitidos')
        return
      }
      setSelectedFile(file)
      setError('')
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return
    uploadMutation.mutate(selectedFile)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload de Currículo
        </CardTitle>
        <CardDescription>
          Faça upload do seu currículo (PDF ou DOCX) para preencher automaticamente seu perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-brown-light rounded-lg cursor-pointer bg-bege-medium hover:bg-bege-light transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-brown-soft" />
              <p className="mb-2 text-sm text-brown-dark">
                <span className="font-semibold">Clique para fazer upload</span> ou arraste o arquivo
              </p>
              <p className="text-xs text-brown-soft">PDF ou DOCX (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
            />
          </label>
        </div>

        {selectedFile && (
          <div className="p-3 rounded-md bg-bege-medium border border-brown-light">
            <p className="text-sm text-brown-dark">
              Arquivo selecionado: <span className="font-medium">{selectedFile.name}</span>
            </p>
            <p className="text-xs text-brown-soft mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-md bg-error/10 border border-error text-error text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
          className="w-full"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analisar Currículo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

