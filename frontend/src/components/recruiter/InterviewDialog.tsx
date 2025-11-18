'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'

interface InterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: number
  candidateName: string
  onSuccess: () => void
}

export function InterviewDialog({
  open,
  onOpenChange,
  applicationId,
  candidateName,
  onSuccess,
}: InterviewDialogProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!date || !time) {
      setError('Data e horário são obrigatórios')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Primeiro aceitar a candidatura
      await api.put(`/applications/${applicationId}/status`, {
        status: 'accepted',
      })

      // Enviar mensagem inicial com os detalhes da entrevista
      const interviewMessage = `Olá! Sua candidatura foi aceita! 🎉

Detalhes da entrevista:
📅 Data: ${date}
🕐 Horário: ${time}
${location ? `📍 Local: ${location}` : ''}
${notes ? `\n📝 Observações:\n${notes}` : ''}

Por favor, confirme sua disponibilidade para este horário ou sugira uma alternativa.`

      await api.post('/messages', {
        application_id: applicationId,
        content: interviewMessage,
      })

      onSuccess()
      onOpenChange(false)
      
      // Reset form
      setDate('')
      setTime('')
      setLocation('')
      setNotes('')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao aceitar candidato e marcar entrevista')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar Entrevista: {candidateName}</DialogTitle>
          <DialogDescription>
            Aceite o candidato e marque uma entrevista preliminar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-error/10 text-error text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Local (presencial ou online)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Escritório - Sala 203 ou Link do Google Meet"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais sobre a entrevista..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !date || !time}>
            {loading ? 'Salvando...' : 'Confirmar e Aceitar Candidato'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

