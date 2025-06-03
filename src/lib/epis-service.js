import { supabase } from './supabaseClient';

export const getEpis = async () => {
  const { data, error } = await supabase
    .from('supabase_epis')
    .select(`
      *,
      funcionarios (
        nome
      )
    `)
    .order('data_entrega', { ascending: false });

  if (error) {
    console.error('Erro ao buscar EPIs:', error);
    return [];
  }
  return data.map(epi => ({
    ...epi,
    funcionarioNome: epi.funcionarios?.nome || 'Funcionário não encontrado'
  }));
};

export const getEpisByFuncionarioId = async (funcionarioId) => {
  const { data, error } = await supabase
    .from('supabase_epis')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .order('data_entrega', { ascending: false });
  if (error) {
    console.error('Erro ao buscar EPIs do funcionário:', error);
    return [];
  }
  return data;
};

export const saveEpi = async (epi) => {
  const epiData = {
    ...epi,
    atualizado_em: new Date().toISOString(),
  };

  if (epi.id) {
    const { data, error } = await supabase
      .from('supabase_epis')
      .update(epiData)
      .eq('id', epi.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('supabase_epis')
      .insert([{ ...epiData, criado_em: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const deleteEpi = async (id) => {
  const { error } = await supabase
    .from('supabase_epis')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar EPI:', error);
    throw error;
  }
  return true;
};