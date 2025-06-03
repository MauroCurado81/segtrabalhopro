import { supabase } from './supabaseClient';

export const getFuncionarios = async () => {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar funcionários:', error);
    return [];
  }
  return data;
};

export const getFuncionarioById = async (id) => {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar funcionário:', error);
    return null;
  }
  return data;
};

export const saveFuncionario = async (funcionario) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userEmpresaId = sessionData?.session?.user?.user_metadata?.empresa_id || (await supabase.rpc('get_user_empresa_id')).data;


  if (!userEmpresaId && !funcionario.empresa_id) {
      console.error('ID da empresa não encontrado para salvar funcionário.');
      throw new Error('ID da empresa é necessário.');
  }
  
  const funcionarioData = {
    ...funcionario,
    empresa_id: funcionario.empresa_id || userEmpresaId,
    atualizado_em: new Date().toISOString(),
  };

  if (funcionario.id) {
    const { data, error } = await supabase
      .from('funcionarios')
      .update(funcionarioData)
      .eq('id', funcionario.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('funcionarios')
      .insert([{ ...funcionarioData, criado_em: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const deleteFuncionario = async (id) => {
  const { error } = await supabase
    .from('funcionarios')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar funcionário:', error);
    throw error;
  }
  return true;
};