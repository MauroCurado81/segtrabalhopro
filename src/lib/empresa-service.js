import { supabase } from './supabaseClient';

export const getEmpresaAtual = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Usuário não autenticado.');
    return null;
  }

  const empresaId = user.user_metadata?.empresa_id || (await supabase.rpc('get_user_empresa_id')).data;

  if (!empresaId) {
    console.warn('Nenhum ID de empresa associado ao usuário.');
    // Tenta buscar na tabela profiles se não encontrar no user_metadata
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('empresa_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData || !profileData.empresa_id) {
      console.error('Erro ao buscar empresa ID do perfil ou empresa ID não encontrado no perfil:', profileError);
      return null;
    }
    // Se encontrou no perfil, usa esse ID
     const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', profileData.empresa_id)
      .single();

    if (empresaError) {
      console.error('Erro ao buscar dados da empresa pelo perfil:', empresaError);
      return null;
    }
    return empresaData;
  }

  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', empresaId)
    .single();

  if (error) {
    console.error('Erro ao buscar dados da empresa:', error);
    return null;
  }
  return data;
};

export const updateEmpresa = async (empresaData) => {
  const { id, ...updateFields } = empresaData;
  if (!id) {
    console.error('ID da empresa é necessário para atualização.');
    throw new Error('ID da empresa não fornecido.');
  }

  const { data, error } = await supabase
    .from('empresas')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar dados da empresa:', error);
    throw error;
  }
  return data;
};

export const getAllEmpresas = async () => {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar todas as empresas:', error);
    return [];
  }
  return data;
};