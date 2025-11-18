import { Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { db } from '../database/connection'

export const getUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    const result = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.bio, u.skills, u.experience, u.education, u.strengths, u.suggestions, 
       u.company, u.industry, u.website, u.location, u.company_size, u.company_description, u.created_at,
       COALESCE(
         json_agg(
           json_build_object('id', t.id, 'name', t.name, 'category', t.category)
         ) FILTER (WHERE t.id IS NOT NULL),
         '[]'
       ) as tags
       FROM users u
       LEFT JOIN user_tags ut ON u.id = ut.user_id
       LEFT JOIN tags t ON ut.tag_id = t.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    )

    if (result.rows.length === 0) {
      throw createError('Usuário não encontrado', 404)
    }

    res.json({
      success: true,
      data: {
        user: {
          ...result.rows[0],
          tags: result.rows[0].tags || [],
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    const { 
      name, 
      bio, 
      skills, 
      experience, 
      education, 
      strengths, 
      suggestions, 
      tag_ids,
      // Campos específicos de recrutador
      company,
      industry,
      website,
      location,
      company_size,
      company_description
    } = req.body

    // Validar e limpar dados JSONB antes de inserir
    // Garantir que arrays sejam sempre arrays válidos (não undefined)
    const cleanExperience = Array.isArray(experience) ? JSON.stringify(experience) : JSON.stringify([])
    const cleanEducation = Array.isArray(education) ? JSON.stringify(education) : JSON.stringify([])
    const cleanSkills = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([])
    const cleanStrengths = Array.isArray(strengths) ? JSON.stringify(strengths) : JSON.stringify([])
    const cleanSuggestions = Array.isArray(suggestions) ? JSON.stringify(suggestions) : JSON.stringify([])

    // Iniciar transação
    await db.query('BEGIN')

    try {
      const result = await db.query(
        `UPDATE users SET
          name = COALESCE($1, name),
          bio = COALESCE($2, bio),
          skills = $3::jsonb,
          experience = $4::jsonb,
          education = $5::jsonb,
          strengths = $6::jsonb,
          suggestions = $7::jsonb,
          company = COALESCE($8, company),
          industry = COALESCE($9, industry),
          website = COALESCE($10, website),
          location = COALESCE($11, location),
          company_size = COALESCE($12, company_size),
          company_description = COALESCE($13, company_description),
          updated_at = NOW()
        WHERE id = $14
        RETURNING id, email, name, role, bio, skills, experience, education, strengths, suggestions, 
        company, industry, website, location, company_size, company_description, created_at`,
        [
          name || null, 
          bio || null, 
          cleanSkills, 
          cleanExperience, 
          cleanEducation, 
          cleanStrengths, 
          cleanSuggestions,
          company || null,
          industry || null,
          website || null,
          location || null,
          company_size || null,
          company_description || null,
          req.user.id
        ]
      )

      // Atualizar tags se fornecidas
      if (tag_ids !== undefined) {
        // Remover tags existentes
        await db.query('DELETE FROM user_tags WHERE user_id = $1', [req.user.id])

        // Inserir novas tags
        if (Array.isArray(tag_ids) && tag_ids.length > 0) {
          for (const tagId of tag_ids) {
            await db.query(
              'INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [req.user.id, tagId]
            )
          }
        }
      }

      await db.query('COMMIT')

      // Buscar usuário com tags atualizadas
      const userWithTags = await db.query(
        `SELECT u.id, u.email, u.name, u.role, u.bio, u.skills, u.experience, u.education, u.strengths, u.suggestions, 
         u.company, u.industry, u.website, u.location, u.company_size, u.company_description, u.created_at,
         COALESCE(
           json_agg(
             json_build_object('id', t.id, 'name', t.name, 'category', t.category)
           ) FILTER (WHERE t.id IS NOT NULL),
           '[]'
         ) as tags
         FROM users u
         LEFT JOIN user_tags ut ON u.id = ut.user_id
         LEFT JOIN tags t ON ut.tag_id = t.id
         WHERE u.id = $1
         GROUP BY u.id`,
        [req.user.id]
      )

      res.json({
        success: true,
        data: {
          user: {
            ...userWithTags.rows[0],
            tags: userWithTags.rows[0].tags || [],
          },
        },
      })
    } catch (error: any) {
      await db.query('ROLLBACK')
      console.error('Error updating user profile:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
      })
      throw createError(
        error.message || 'Erro ao atualizar perfil',
        error.statusCode || 500
      )
    }
  } catch (error: any) {
    console.error('Error in updateUserProfile:', error)
    next(error)
  }
}


