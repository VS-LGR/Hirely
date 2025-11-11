import { db } from './connection'

interface TagData {
  name: string
  category: string
  parent_id?: number
}

const tags: TagData[] = [
  // Tecnologia - Categorias principais
  { name: 'Tecnologia', category: 'Tecnologia' },
  { name: 'Frontend', category: 'Tecnologia' },
  { name: 'Backend', category: 'Tecnologia' },
  { name: 'Mobile', category: 'Tecnologia' },
  { name: 'DevOps', category: 'Tecnologia' },
  { name: 'Data Science', category: 'Tecnologia' },
  { name: 'Segurança', category: 'Tecnologia' },
  { name: 'Cloud Computing', category: 'Tecnologia' },
  { name: 'QA/Testes', category: 'Tecnologia' },
  { name: 'Arquitetura de Software', category: 'Tecnologia' },
  
  // Frontend
  { name: 'React', category: 'Tecnologia' },
  { name: 'Vue.js', category: 'Tecnologia' },
  { name: 'Angular', category: 'Tecnologia' },
  { name: 'JavaScript', category: 'Tecnologia' },
  { name: 'TypeScript', category: 'Tecnologia' },
  { name: 'HTML', category: 'Tecnologia' },
  { name: 'CSS', category: 'Tecnologia' },
  { name: 'SASS/SCSS', category: 'Tecnologia' },
  { name: 'Tailwind CSS', category: 'Tecnologia' },
  { name: 'Next.js', category: 'Tecnologia' },
  { name: 'Nuxt.js', category: 'Tecnologia' },
  { name: 'Svelte', category: 'Tecnologia' },
  
  // Backend
  { name: 'Node.js', category: 'Tecnologia' },
  { name: 'Python', category: 'Tecnologia' },
  { name: 'Java', category: 'Tecnologia' },
  { name: 'C#', category: 'Tecnologia' },
  { name: 'PHP', category: 'Tecnologia' },
  { name: 'Ruby', category: 'Tecnologia' },
  { name: 'Go', category: 'Tecnologia' },
  { name: 'Rust', category: 'Tecnologia' },
  { name: 'Django', category: 'Tecnologia' },
  { name: 'Flask', category: 'Tecnologia' },
  { name: 'Spring Boot', category: 'Tecnologia' },
  { name: 'Express.js', category: 'Tecnologia' },
  { name: 'Laravel', category: 'Tecnologia' },
  { name: 'ASP.NET', category: 'Tecnologia' },
  
  // Mobile
  { name: 'React Native', category: 'Tecnologia' },
  { name: 'Flutter', category: 'Tecnologia' },
  { name: 'Swift', category: 'Tecnologia' },
  { name: 'Kotlin', category: 'Tecnologia' },
  { name: 'iOS', category: 'Tecnologia' },
  { name: 'Android', category: 'Tecnologia' },
  { name: 'Xamarin', category: 'Tecnologia' },
  { name: 'Ionic', category: 'Tecnologia' },
  
  // DevOps
  { name: 'Docker', category: 'Tecnologia' },
  { name: 'Kubernetes', category: 'Tecnologia' },
  { name: 'AWS', category: 'Tecnologia' },
  { name: 'Azure', category: 'Tecnologia' },
  { name: 'GCP', category: 'Tecnologia' },
  { name: 'CI/CD', category: 'Tecnologia' },
  { name: 'Jenkins', category: 'Tecnologia' },
  { name: 'GitLab CI', category: 'Tecnologia' },
  { name: 'GitHub Actions', category: 'Tecnologia' },
  { name: 'Terraform', category: 'Tecnologia' },
  { name: 'Ansible', category: 'Tecnologia' },
  
  // Data Science
  { name: 'Machine Learning', category: 'Tecnologia' },
  { name: 'Deep Learning', category: 'Tecnologia' },
  { name: 'Data Analysis', category: 'Tecnologia' },
  { name: 'Big Data', category: 'Tecnologia' },
  { name: 'SQL', category: 'Tecnologia' },
  { name: 'PostgreSQL', category: 'Tecnologia' },
  { name: 'MySQL', category: 'Tecnologia' },
  { name: 'MongoDB', category: 'Tecnologia' },
  { name: 'Redis', category: 'Tecnologia' },
  { name: 'Pandas', category: 'Tecnologia' },
  { name: 'NumPy', category: 'Tecnologia' },
  { name: 'TensorFlow', category: 'Tecnologia' },
  { name: 'PyTorch', category: 'Tecnologia' },
  
  // Design
  { name: 'Design', category: 'Design' },
  { name: 'UI/UX Design', category: 'Design' },
  { name: 'Design Gráfico', category: 'Design' },
  { name: 'Web Design', category: 'Design' },
  { name: 'Motion Graphics', category: 'Design' },
  { name: 'Design de Produto', category: 'Design' },
  { name: 'Design de Interiores', category: 'Design' },
  { name: 'Figma', category: 'Design' },
  { name: 'Adobe Photoshop', category: 'Design' },
  { name: 'Adobe Illustrator', category: 'Design' },
  { name: 'Adobe XD', category: 'Design' },
  { name: 'Sketch', category: 'Design' },
  { name: 'InDesign', category: 'Design' },
  { name: 'After Effects', category: 'Design' },
  { name: 'Premiere Pro', category: 'Design' },
  
  // Produção
  { name: 'Produção', category: 'Produção' },
  { name: 'Operador de Máquinas', category: 'Produção' },
  { name: 'Controle de Qualidade', category: 'Produção' },
  { name: 'Logística', category: 'Produção' },
  { name: 'Almoxarifado', category: 'Produção' },
  { name: 'Produção Industrial', category: 'Produção' },
  { name: 'Manutenção Industrial', category: 'Produção' },
  { name: 'Soldagem', category: 'Produção' },
  { name: 'Usinagem', category: 'Produção' },
  { name: 'Montagem', category: 'Produção' },
  { name: 'Embalagem', category: 'Produção' },
  { name: 'Expedição', category: 'Produção' },
  { name: 'Gestão de Produção', category: 'Produção' },
  { name: 'Lean Manufacturing', category: 'Produção' },
  
  // Agricultura
  { name: 'Agricultura', category: 'Agricultura' },
  { name: 'Agronomia', category: 'Agricultura' },
  { name: 'Pecuária', category: 'Agricultura' },
  { name: 'Irrigação', category: 'Agricultura' },
  { name: 'Agricultura Orgânica', category: 'Agricultura' },
  { name: 'Agronegócio', category: 'Agricultura' },
  { name: 'Técnico Agrícola', category: 'Agricultura' },
  { name: 'Operador de Máquinas Agrícolas', category: 'Agricultura' },
  { name: 'Veterinária', category: 'Agricultura' },
  { name: 'Zootecnia', category: 'Agricultura' },
  { name: 'Silvicultura', category: 'Agricultura' },
  { name: 'Apicultura', category: 'Agricultura' },
  
  // Limpeza
  { name: 'Limpeza', category: 'Limpeza' },
  { name: 'Limpeza Industrial', category: 'Limpeza' },
  { name: 'Limpeza Doméstica', category: 'Limpeza' },
  { name: 'Limpeza Hospitalar', category: 'Limpeza' },
  { name: 'Limpeza Comercial', category: 'Limpeza' },
  { name: 'Zeladoria', category: 'Limpeza' },
  { name: 'Conservação', category: 'Limpeza' },
  { name: 'Auxiliar de Limpeza', category: 'Limpeza' },
  
  // Saúde
  { name: 'Saúde', category: 'Saúde' },
  { name: 'Enfermagem', category: 'Saúde' },
  { name: 'Medicina', category: 'Saúde' },
  { name: 'Fisioterapia', category: 'Saúde' },
  { name: 'Nutrição', category: 'Saúde' },
  { name: 'Psicologia', category: 'Saúde' },
  { name: 'Farmácia', category: 'Saúde' },
  { name: 'Odontologia', category: 'Saúde' },
  { name: 'Radiologia', category: 'Saúde' },
  { name: 'Biomedicina', category: 'Saúde' },
  { name: 'Fonoaudiologia', category: 'Saúde' },
  { name: 'Terapia Ocupacional', category: 'Saúde' },
  { name: 'Técnico em Enfermagem', category: 'Saúde' },
  { name: 'Auxiliar de Enfermagem', category: 'Saúde' },
  { name: 'Recepcionista de Clínica', category: 'Saúde' },
  
  // Educação
  { name: 'Educação', category: 'Educação' },
  { name: 'Pedagogia', category: 'Educação' },
  { name: 'Ensino Superior', category: 'Educação' },
  { name: 'EAD', category: 'Educação' },
  { name: 'Professor', category: 'Educação' },
  { name: 'Coordenador Pedagógico', category: 'Educação' },
  { name: 'Diretor de Escola', category: 'Educação' },
  { name: 'Instrutor', category: 'Educação' },
  { name: 'Tutor', category: 'Educação' },
  { name: 'Monitor', category: 'Educação' },
  { name: 'Auxiliar de Sala', category: 'Educação' },
  { name: 'Biblioteconomia', category: 'Educação' },
  
  // Vendas
  { name: 'Vendas', category: 'Vendas' },
  { name: 'Vendedor', category: 'Vendas' },
  { name: 'Representante Comercial', category: 'Vendas' },
  { name: 'Gerente de Vendas', category: 'Vendas' },
  { name: 'Vendas Externas', category: 'Vendas' },
  { name: 'Vendas Internas', category: 'Vendas' },
  { name: 'Atendimento ao Cliente', category: 'Vendas' },
  { name: 'Telemarketing', category: 'Vendas' },
  { name: 'E-commerce', category: 'Vendas' },
  { name: 'Vendas B2B', category: 'Vendas' },
  { name: 'Vendas B2C', category: 'Vendas' },
  { name: 'Inside Sales', category: 'Vendas' },
  { name: 'Account Manager', category: 'Vendas' },
  
  // Administração
  { name: 'Administração', category: 'Administração' },
  { name: 'RH', category: 'Administração' },
  { name: 'Recrutamento e Seleção', category: 'Administração' },
  { name: 'Financeiro', category: 'Administração' },
  { name: 'Contabilidade', category: 'Administração' },
  { name: 'Fiscal', category: 'Administração' },
  { name: 'Compras', category: 'Administração' },
  { name: 'Secretariado', category: 'Administração' },
  { name: 'Assistente Administrativo', category: 'Administração' },
  { name: 'Auxiliar Administrativo', category: 'Administração' },
  { name: 'Recepcionista', category: 'Administração' },
  { name: 'Atendente', category: 'Administração' },
  { name: 'Gestão de Pessoas', category: 'Administração' },
  { name: 'DP', category: 'Administração' },
  { name: 'Folha de Pagamento', category: 'Administração' },
  { name: 'Gestão de Projetos', category: 'Administração' },
  { name: 'PMO', category: 'Administração' },
  
  // Marketing
  { name: 'Marketing', category: 'Marketing' },
  { name: 'Marketing Digital', category: 'Marketing' },
  { name: 'Social Media', category: 'Marketing' },
  { name: 'SEO', category: 'Marketing' },
  { name: 'SEM', category: 'Marketing' },
  { name: 'Google Ads', category: 'Marketing' },
  { name: 'Facebook Ads', category: 'Marketing' },
  { name: 'Content Marketing', category: 'Marketing' },
  { name: 'Email Marketing', category: 'Marketing' },
  { name: 'Inbound Marketing', category: 'Marketing' },
  { name: 'Analytics', category: 'Marketing' },
  { name: 'Branding', category: 'Marketing' },
  { name: 'Publicidade', category: 'Marketing' },
  { name: 'Comunicação', category: 'Marketing' },
  { name: 'Jornalismo', category: 'Marketing' },
  { name: 'Relações Públicas', category: 'Marketing' },
  
  // Engenharia
  { name: 'Engenharia', category: 'Engenharia' },
  { name: 'Engenharia Civil', category: 'Engenharia' },
  { name: 'Engenharia Mecânica', category: 'Engenharia' },
  { name: 'Engenharia Elétrica', category: 'Engenharia' },
  { name: 'Engenharia de Produção', category: 'Engenharia' },
  { name: 'Engenharia Química', category: 'Engenharia' },
  { name: 'Engenharia de Software', category: 'Engenharia' },
  { name: 'Engenharia Ambiental', category: 'Engenharia' },
  { name: 'Engenharia de Segurança', category: 'Engenharia' },
  { name: 'Técnico em Engenharia', category: 'Engenharia' },
  
  // Construção Civil
  { name: 'Construção Civil', category: 'Construção Civil' },
  { name: 'Pedreiro', category: 'Construção Civil' },
  { name: 'Carpinteiro', category: 'Construção Civil' },
  { name: 'Eletricista', category: 'Construção Civil' },
  { name: 'Encanador', category: 'Construção Civil' },
  { name: 'Pintor', category: 'Construção Civil' },
  { name: 'Arquiteto', category: 'Construção Civil' },
  { name: 'Mestre de Obras', category: 'Construção Civil' },
  { name: 'Ajudante de Obras', category: 'Construção Civil' },
  { name: 'Armador', category: 'Construção Civil' },
  { name: 'Gesseiro', category: 'Construção Civil' },
  { name: 'Azulejista', category: 'Construção Civil' },
  
  // Gastronomia
  { name: 'Gastronomia', category: 'Gastronomia' },
  { name: 'Chef de Cozinha', category: 'Gastronomia' },
  { name: 'Cozinheiro', category: 'Gastronomia' },
  { name: 'Auxiliar de Cozinha', category: 'Gastronomia' },
  { name: 'Confeiteiro', category: 'Gastronomia' },
  { name: 'Padeiro', category: 'Gastronomia' },
  { name: 'Garçom', category: 'Gastronomia' },
  { name: 'Bartender', category: 'Gastronomia' },
  { name: 'Barista', category: 'Gastronomia' },
  { name: 'Sommelier', category: 'Gastronomia' },
  
  // Transporte e Logística
  { name: 'Transporte', category: 'Transporte' },
  { name: 'Motorista', category: 'Transporte' },
  { name: 'Motorista de Caminhão', category: 'Transporte' },
  { name: 'Entregador', category: 'Transporte' },
  { name: 'Motoboy', category: 'Transporte' },
  { name: 'Operador de Empilhadeira', category: 'Transporte' },
  { name: 'Ajudante de Carga e Descarga', category: 'Transporte' },
  { name: 'Despachante', category: 'Transporte' },
  { name: 'Agente de Carga', category: 'Transporte' },
  
  // Segurança
  { name: 'Segurança', category: 'Segurança' },
  { name: 'Vigilante', category: 'Segurança' },
  { name: 'Porteiro', category: 'Segurança' },
  { name: 'Segurança Patrimonial', category: 'Segurança' },
  { name: 'Segurança do Trabalho', category: 'Segurança' },
  { name: 'Técnico em Segurança', category: 'Segurança' },
  
  // Beleza e Estética
  { name: 'Beleza', category: 'Beleza' },
  { name: 'Cabeleireiro', category: 'Beleza' },
  { name: 'Barbeiro', category: 'Beleza' },
  { name: 'Manicure', category: 'Beleza' },
  { name: 'Pedicure', category: 'Beleza' },
  { name: 'Esteticista', category: 'Beleza' },
  { name: 'Massagista', category: 'Beleza' },
  { name: 'Maquiador', category: 'Beleza' },
  
  // Jurídico
  { name: 'Jurídico', category: 'Jurídico' },
  { name: 'Advogado', category: 'Jurídico' },
  { name: 'Assistente Jurídico', category: 'Jurídico' },
  { name: 'Estagiário Jurídico', category: 'Jurídico' },
  { name: 'Analista Jurídico', category: 'Jurídico' },
  
  // Outros
  { name: 'Atendimento', category: 'Atendimento' },
  { name: 'Call Center', category: 'Atendimento' },
  { name: 'Suporte Técnico', category: 'Atendimento' },
  { name: 'SAC', category: 'Atendimento' },
  { name: 'Operador de Telemarketing', category: 'Atendimento' },
]

const seedTags = async () => {
  try {
    // Limpar tabela de tags
    await db.query('DELETE FROM tags')
    
    // Inserir tags e armazenar IDs
    const tagMap = new Map<string, number>()
    
    // Inserir todas as tags (todas são do mesmo nível hierárquico por enquanto)
    for (const tag of tags) {
      const result = await db.query(
        'INSERT INTO tags (name, category, parent_id) VALUES ($1, $2, $3) RETURNING id',
        [tag.name, tag.category, tag.parent_id || null]
      )
      tagMap.set(tag.name, result.rows[0].id)
    }
    
    console.log(`✅ ${tags.length} tags seeded successfully`)
  } catch (error) {
    console.error('❌ Error seeding tags:', error)
    throw error
  }
}

// Run seed if called directly
if (require.main === module) {
  seedTags()
    .then(() => {
      console.log('Tag seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Tag seeding failed:', error)
      process.exit(1)
    })
}

export { seedTags }

