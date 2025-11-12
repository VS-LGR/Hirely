import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase()

  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdfParse(dataBuffer)
      return data.text
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath })
      return result.value
    } else {
      throw new Error('Formato de arquivo não suportado')
    }
  } catch (error) {
    console.error('Error extracting text from file:', error)
    throw new Error('Erro ao extrair texto do arquivo')
  }
}

