import axios from 'axios'

// Garantir que a baseURL sempre termine com /api e tenha protocolo
const getBaseURL = () => {
  let envURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  
  // Garantir que a URL tenha protocolo (https:// ou http://)
  if (!envURL.startsWith('http://') && !envURL.startsWith('https://')) {
    // Se não tiver protocolo, adicionar https:// (produção) ou http:// (desenvolvimento)
    envURL = envURL.includes('localhost') ? `http://${envURL}` : `https://${envURL}`
  }
  
  const baseURL = envURL.endsWith('/api') ? envURL : `${envURL}/api`
  if (typeof window !== 'undefined') {
    console.log('API Base URL:', baseURL)
  }
  return baseURL
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Token found, adding to request header')
    } else {
      console.log('No token found in localStorage')
    }
    const requestURL = config.baseURL ? `${config.baseURL}${config.url || ''}` : config.url || ''
    console.log('Making request to:', requestURL, 'Headers:', { Authorization: token ? 'Bearer ***' : 'none' })
  }
  return config
})

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api


