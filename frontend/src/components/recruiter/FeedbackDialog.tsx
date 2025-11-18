'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: number
  jobId: number
  candidateId: number
  candidateName: string
  onSuccess: () => void
}

export function FeedbackDialog({
  open,
  onOpenChange,
  applicationId,
  jobId,
  candidateId,
  candidateName,
  onSuccess,
}: FeedbackDialogProps) {
  const [bulletPoints, setBulletPoints] = useState<string[]>([''])
  const [generatedFeedback, setGeneratedFeedback] = useState('')
  const [finalFeedback, setFinalFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleAddBulletPoint = () => {
    setBulletPoints([...bulletPoints, ''])
  }

  const handleRemoveBulletPoint = (index: number) => {
    setBulletPoints(bulletPoints.filter((_, i) => i !== index))
  }

  const handleBulletPointChange = (index: number, value: string) => {
    const newPoints = [...bulletPoints]
    newPoints[index] = value
    setBulletPoints(newPoints)
  }

  const handleGenerateFeedback = async () => {
    const validPoints = bulletPoints.filter((bp) => bp.trim().length > 0)
    if (validPoints.length === 0) {
      setError('Adicione pelo menos um ponto de feedback')
      return
    }

    setError('')
    setGenerating(true)

    try {
      const response = await api.post('/ai/generate-feedback', {
        job_id: jobId,
        candidate_id: candidateId,
        bullet_points: validPoints,
      })

      const feedback = response.data.data.feedback
      setGeneratedFeedback(feedback)
      setFinalFeedback(feedback)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao gerar feedback')
    } finally {
      setGenerating(false)
    }
  }

  const handleReject = async () => {
    if (!finalFeedback.trim()) {
      setError('O feedback é obrigatório para rejeitar um candidato')
      return
    }

    setError('')
    setLoading(true)

    try {
      await api.put(`/applications/${applicationId}/status`, {
        status: 'rejected',
        feedback: finalFeedback.trim(),
      })
      onSuccess()
      onOpenChange(false)
      // Reset form
      setBulletPoints([''])
      setGeneratedFeedback('')
      setFinalFeedback('')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao rejeitar candidato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rejeitar Candidato: {candidateName}</DialogTitle>
          <DialogDescription>
            O feedback é obrigatório ao rejeitar um candidato. Adicione pontos específicos e gere um feedback personalizado com IA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-error/10 text-error text-sm">
              {error}
            </div>
          )}

          <div>
            <Label>Pontos de Feedback (obrigatório)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Adicione pontos específicos sobre o candidato. A IA usará estes pontos para gerar um feedback personalizado.
            </p>
            {bulletPoints.map((point, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={point}
                  onChange={(e) => handleBulletPointChange(index, e.target.value)}
                  placeholder={`Ponto ${index + 1} (ex: Falta experiência em React)`}
                  className="flex-1"
                />
                {bulletPoints.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveBulletPoint(index)}
                  >
                    Remover
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBulletPoint}
              className="mt-2"
            >
              + Adicionar Ponto
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleGenerateFeedback}
              disabled={generating || bulletPoints.filter((bp) => bp.trim().length > 0).length === 0}
              className="flex-1"
            >
              {generating ? 'Gerando...' : 'Gerar Feedback com IA'}
            </Button>
          </div>

          {generatedFeedback && (
            <div>
              <Label>Feedback Gerado (você pode editar)</Label>
              <Textarea
                value={finalFeedback}
                onChange={(e) => setFinalFeedback(e.target.value)}
                className="min-h-[200px] mt-2"
                placeholder="O feedback será gerado aqui..."
              />
            </div>
          )}

          {!generatedFeedback && (
            <div>
              <Label>Feedback Manual</Label>
              <Textarea
                value={finalFeedback}
                onChange={(e) => setFinalFeedback(e.target.value)}
                className="min-h-[200px] mt-2"
                placeholder="Digite o feedback personalizado para o candidato..."
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleReject}
            disabled={loading || !finalFeedback.trim()}
            variant="destructive"
          >
            {loading ? 'Rejeitando...' : 'Confirmar Rejeição'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

