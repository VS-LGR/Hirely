import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

/**
 * Extrai texto de um arquivo (PDF ou DOCX)
 * Aceita tanto filePath (string) quanto Buffer
 */
export async function extractTextFromFile(filePathOrBuffer: string | Buffer, fileName?: string): Promise<string> {
  let ext: string
  let dataBuffer: Buffer

  try {
    if (Buffer.isBuffer(filePathOrBuffer)) {
      // Se for Buffer, usar fileName para determinar extensão
      if (!fileName) {
        throw new Error('fileName é obrigatório quando filePathOrBuffer é um Buffer')
      }
      ext = path.extname(fileName).toLowerCase()
      dataBuffer = filePathOrBuffer
    } else {
      // Se for string (filePath)
      if (!fs.existsSync(filePathOrBuffer)) {
        throw new Error(`Arquivo não encontrado: ${filePathOrBuffer}`)
      }
      ext = path.extname(filePathOrBuffer).toLowerCase()
      dataBuffer = fs.readFileSync(filePathOrBuffer)
    }

    if (ext === '.pdf') {
      console.log('Parsing PDF file...')
      const data = await pdfParse(dataBuffer)
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('O arquivo PDF não contém texto extraível')
      }
      return data.text
    } else if (ext === '.docx' || ext === '.doc') {
      console.log('Parsing DOCX file...')
      // mammoth precisa de um Buffer ou path
      const result = await mammoth.extractRawText({ buffer: dataBuffer })
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('O arquivo DOCX não contém texto extraível')
      }
      return result.value
    } else {
      throw new Error(`Formato de arquivo não suportado: ${ext}`)
    }
  } catch (error: any) {
    console.error('Error extracting text from file:', error)
    if (error.message) {
      throw error
    }
    throw new Error('Erro ao extrair texto do arquivo')
  }
}

