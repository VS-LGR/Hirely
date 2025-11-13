// Entry point para Vercel Serverless Functions
// Este arquivo exporta o app Express como uma função serverless
import app from '../src/index'

// Para Vercel, precisamos exportar como handler
export default app

