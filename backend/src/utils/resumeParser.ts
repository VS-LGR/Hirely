import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase()

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`)
    }

    if (ext === '.pdf') {
      console.log('Parsing PDF file...')
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdfParse(dataBuffer)
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('O arquivo PDF não contém texto extraível')
      }
      return data.text
    } else if (ext === '.docx' || ext === '.doc') {
      console.log('Parsing DOCX file...')
      const result = await mammoth.extractRawText({ path: filePath })
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

