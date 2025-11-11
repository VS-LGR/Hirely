import api from '@/lib/api'
import { Tag } from '@/types'

export const tagService = {
  async getTags(category?: string): Promise<Tag[]> {
    const params = category ? { category } : {}
    const response = await api.get('/tags', { params })
    return response.data.data.tags
  },

  async getTagsByCategory(category: string): Promise<Tag[]> {
    const response = await api.get(`/tags/category/${category}`)
    return response.data.data.tags
  },

  async searchTags(query: string): Promise<Tag[]> {
    const response = await api.get('/tags/search', { params: { q: query } })
    return response.data.data.tags
  },
}

