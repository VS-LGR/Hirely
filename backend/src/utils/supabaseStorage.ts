import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Inicializar cliente Supabase
let supabaseClient: SupabaseClient | null = null

const getSupabaseClient = (): SupabaseClient => {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL e Key são obrigatórios. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY')
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseClient
}

// Bucket para currículos
const RESUMES_BUCKET = 'resumes'

/**
 * Upload de arquivo para Supabase Storage
 */
export const uploadFileToSupabase = async (
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<{ path: string; url: string }> => {
  const supabase = getSupabaseClient()

  // Gerar nome único para o arquivo
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
  const ext = fileName.split('.').pop() || ''
  const uniqueFileName = `resume-${uniqueSuffix}.${ext}`

  // Upload do arquivo
  const { data, error } = await supabase.storage
    .from(RESUMES_BUCKET)
    .upload(uniqueFileName, file, {
      contentType,
      upsert: false,
    })

  if (error) {
    console.error('Error uploading file to Supabase:', error)
    throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`)
  }

  // Obter URL pública do arquivo
  const { data: urlData } = supabase.storage
    .from(RESUMES_BUCKET)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

/**
 * Download de arquivo do Supabase Storage
 */
export const downloadFileFromSupabase = async (filePath: string): Promise<Buffer> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.storage
    .from(RESUMES_BUCKET)
    .download(filePath)

  if (error) {
    console.error('Error downloading file from Supabase:', error)
    throw new Error(`Erro ao baixar arquivo: ${error.message}`)
  }

  if (!data) {
    throw new Error('Arquivo não encontrado')
  }

  // Converter Blob para Buffer
  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Deletar arquivo do Supabase Storage
 */
export const deleteFileFromSupabase = async (filePath: string): Promise<void> => {
  const supabase = getSupabaseClient()

  const { error } = await supabase.storage
    .from(RESUMES_BUCKET)
    .remove([filePath])

  if (error) {
    console.error('Error deleting file from Supabase:', error)
    // Não lançar erro, apenas logar (arquivo pode já ter sido deletado)
  }
}

/**
 * Verificar se o bucket existe e criar se necessário
 */
export const ensureBucketExists = async (): Promise<void> => {
  const supabase = getSupabaseClient()

  // Verificar se o bucket existe
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('Error listing buckets:', listError)
    return
  }

  const bucketExists = buckets?.some((bucket) => bucket.name === RESUMES_BUCKET)

  if (!bucketExists) {
    console.warn(`Bucket "${RESUMES_BUCKET}" não existe. Crie-o manualmente no dashboard do Supabase.`)
    console.warn('Configuração recomendada:')
    console.warn('- Nome: resumes')
    console.warn('- Público: Não')
    console.warn('- Política de acesso: Apenas autenticados podem fazer upload')
  }
}

