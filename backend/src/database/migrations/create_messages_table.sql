-- Migration: Criar tabela de mensagens entre recrutador e candidato
-- Execute este script no SQL Editor do Supabase Dashboard

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_messages_application_id ON messages(application_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = false;

-- Comentários para documentação
COMMENT ON TABLE messages IS 'Mensagens entre recrutador e candidato relacionadas a uma aplicação';
COMMENT ON COLUMN messages.application_id IS 'ID da aplicação relacionada à conversa';
COMMENT ON COLUMN messages.sender_id IS 'ID do usuário que enviou a mensagem';
COMMENT ON COLUMN messages.receiver_id IS 'ID do usuário que recebeu a mensagem';
COMMENT ON COLUMN messages.is_read IS 'Indica se a mensagem foi lida pelo destinatário';

