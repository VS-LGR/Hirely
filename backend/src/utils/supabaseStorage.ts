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
    console.error('❌ Supabase não configurado:')
    console.error('   SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Faltando')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Faltando')
    console.error('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Faltando')
    throw new Error('Supabase URL e Key são obrigatórios. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY')
  }

  // Validar formato da URL
  if (!supabaseUrl.startsWith('https://') && !supabaseUrl.startsWith('http://')) {
    throw new Error(`SUPABASE_URL deve começar com https:// ou http://. Valor atual: ${supabaseUrl}`)
  }

  // Remover barra final se houver
  const cleanUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl

  console.log('🔧 Inicializando cliente Supabase:', {
    url: cleanUrl,
    hasKey: !!supabaseKey,
    keyLength: supabaseKey?.length || 0,
  })

  supabaseClient = createClient(cleanUrl, supabaseKey, {
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
  try {
    const supabase = getSupabaseClient()

    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError)
      // Se o erro for de autenticação/URL, fornecer mensagem mais clara
      if (listError.message?.includes('XML') || listError.message?.includes('html')) {
        throw new Error('URL do Supabase incorreta ou credenciais inválidas. Verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Vercel.')
      }
      throw new Error(`Erro ao verificar buckets: ${listError.message}`)
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === RESUMES_BUCKET)
    
    if (!bucketExists) {
      console.error(`❌ Bucket "${RESUMES_BUCKET}" não existe`)
      console.error('📋 Buckets disponíveis:', buckets?.map(b => b.name).join(', ') || 'Nenhum')
      throw new Error(`Bucket "${RESUMES_BUCKET}" não existe. Crie-o no dashboard do Supabase: Storage > New bucket > Name: resumes`)
    }

    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = fileName.split('.').pop() || ''
    const uniqueFileName = `resume-${uniqueSuffix}.${ext}`

    console.log(`📤 Fazendo upload de ${fileName} para bucket ${RESUMES_BUCKET}...`)

    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(RESUMES_BUCKET)
      .upload(uniqueFileName, file, {
        contentType,
        upsert: false,
      })

    if (error) {
      console.error('❌ Erro ao fazer upload:', error)
      
      // Mensagens de erro mais específicas
      if (error.message?.includes('XML') || error.message?.includes('html')) {
        throw new Error('URL do Supabase incorreta ou credenciais inválidas. Verifique as variáveis de ambiente no Vercel.')
      }
      
      if (error.message?.includes('Bucket not found')) {
        throw new Error(`Bucket "${RESUMES_BUCKET}" não encontrado. Crie-o no dashboard do Supabase.`)
      }
      
      if (error.message?.includes('new row violates row-level security')) {
        throw new Error('Política de segurança do bucket bloqueou o upload. Configure as políticas no Supabase: Storage > resumes > Policies')
      }
      
      throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`)
    }

    if (!data) {
      throw new Error('Upload retornou sem dados')
    }

    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from(RESUMES_BUCKET)
      .getPublicUrl(data.path)

    console.log(`✅ Upload concluído: ${data.path}`)

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error: any) {
    // Capturar erros de parsing JSON (XML/HTML retornado)
    if (error.message?.includes('Unexpected token') || error.message?.includes('XML')) {
      console.error('❌ Supabase retornou XML/HTML em vez de JSON')
      console.error('   Isso geralmente indica:')
      console.error('   1. URL incorreta (verifique SUPABASE_URL)')
      console.error('   2. Credenciais inválidas (verifique SUPABASE_SERVICE_ROLE_KEY)')
      console.error('   3. Bucket não existe ou não tem permissões')
      throw new Error('Configuração do Supabase incorreta. Verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Vercel.')
    }
    
    throw error
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

