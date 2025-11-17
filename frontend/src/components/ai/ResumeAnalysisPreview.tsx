'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, Check, X, Edit2 } from 'lucide-react'

interface ResumeAnalysis {
  skills: string[]
  experience: Array<{
    company: string
    position: string | null
    startDate: string
    endDate?: string | null
    description?: string | null
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string | null
  }>
  bio?: string
  suggestedTags: Array<{ name: string; category: string }>
  strengths: string[]
  suggestions: string[]
}

interface ResumeAnalysisPreviewProps {
  open: boolean
  analysis: ResumeAnalysis | null
  onApply: (analysis: ResumeAnalysis) => void
  onCancel: () => void
}

export function ResumeAnalysisPreview({
  open,
  analysis,
  onApply,
  onCancel,
}: ResumeAnalysisPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedBio, setEditedBio] = useState('')

  if (!analysis) return null

  // Formatar bio com quebras de linha e melhor formatação
  const formatBio = (bio: string) => {
    if (!bio) return ''
    
    // Limpar e normalizar a bio
    let cleanedBio = bio
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Remover múltiplas quebras de linha
      .replace(/[ \t]+/g, ' ') // Normalizar espaços
      .replace(/\s+\./g, '.') // Remover espaços antes de pontos
    
    // Dividir por parágrafos (quebras duplas) ou por frases longas
    const paragraphs = cleanedBio.split(/\n\n+/).filter(p => p.trim())
    
    // Se não houver parágrafos explícitos, tentar criar baseado em pontos finais
    if (paragraphs.length === 1 && cleanedBio.length > 200) {
      // Dividir em sentenças e agrupar em parágrafos
      const sentences = cleanedBio.split(/[.!?]+/).filter(s => s.trim().length > 20)
      const grouped: string[] = []
      let currentGroup = ''
      
      sentences.forEach((sentence, index) => {
        const trimmed = sentence.trim()
        if (trimmed) {
          currentGroup += (currentGroup ? '. ' : '') + trimmed
          // Criar parágrafo a cada 2-3 frases ou se atingir ~150 caracteres
          if ((index + 1) % 3 === 0 || currentGroup.length > 150) {
            grouped.push(currentGroup + '.')
            currentGroup = ''
          }
        }
      })
      if (currentGroup) {
        grouped.push(currentGroup + '.')
      }
      
      return grouped.length > 0 
        ? grouped.map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-4' : ''} style={{ lineHeight: '1.6' }}>
              {p.trim()}
            </p>
          ))
        : paragraphs.map((paragraph, index) => (
            <p key={index} className={index > 0 ? 'mt-4' : ''} style={{ lineHeight: '1.6' }}>
              {paragraph.trim()}
            </p>
          ))
    }
    
    // Retornar parágrafos formatados
    return paragraphs.map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-4' : ''} style={{ lineHeight: '1.6' }}>
        {paragraph.trim()}
      </p>
    ))
  }

  const handleEdit = () => {
    setEditedBio(analysis.bio || '')
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (editedBio.trim()) {
      onApply({
        ...analysis,
        bio: editedBio,
      })
      setIsEditing(false)
    }
  }

  const handleApply = () => {
    if (isEditing && editedBio.trim()) {
      onApply({
        ...analysis,
        bio: editedBio,
      })
    } else {
      onApply(analysis)
    }
    setIsEditing(false)
  }

  const displayBio = isEditing ? editedBio : (analysis.bio || '')

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prévia da Análise do Currículo
          </DialogTitle>
          <DialogDescription>
            Revise as informações extraídas antes de aplicar ao seu perfil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Biografia */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio" className="text-base font-semibold">
                Biografia
              </Label>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  id="bio"
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  rows={8}
                  className="font-normal"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4 mr-1" />
                    Salvar Edição
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setEditedBio('')
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-md bg-bege-medium border border-brown-light text-sm text-brown-dark whitespace-pre-wrap">
                {formatBio(displayBio)}
              </div>
            )}
          </div>

          {/* Experiência */}
          {analysis.experience.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Experiência</Label>
              <div className="space-y-3">
                {analysis.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-md bg-bege-medium border border-brown-light"
                  >
                    <p className="font-medium text-brown-dark">{exp.position || 'Cargo não especificado'}</p>
                    <p className="text-sm text-brown-soft">{exp.company}</p>
                    <p className="text-xs text-brown-soft mt-1">
                      {exp.startDate} - {exp.endDate || 'Atual'}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-brown-dark mt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Educação */}
          {analysis.education.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Educação</Label>
              <div className="space-y-3">
                {analysis.education.map((edu, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-md bg-bege-medium border border-brown-light"
                  >
                    <p className="font-medium text-brown-dark">{edu.degree}</p>
                    <p className="text-sm text-brown-soft">{edu.institution}</p>
                    <p className="text-sm text-brown-dark mt-1">{edu.field}</p>
                    <p className="text-xs text-brown-soft mt-1">
                      {edu.startDate} - {edu.endDate || 'Atual'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Sugeridas */}
          {analysis.suggestedTags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Tags Sugeridas</Label>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm border border-primary/20"
                  >
                    {tag.name}
                    {tag.category && (
                      <span className="ml-1 text-xs opacity-70">
                        ({tag.category})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pontos Fortes */}
          {analysis.strengths.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Pontos Fortes</Label>
              <ul className="list-disc list-inside space-y-1 text-sm text-brown-dark">
                {analysis.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            <Check className="h-4 w-4 mr-2" />
            Aplicar ao Perfil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

