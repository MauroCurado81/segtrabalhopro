import { supabase } from './supabaseClient';

export const getNrs = async () => {
  const { data, error } = await supabase
    .from('supabase_nrs')
    .select(`
      *,
      funcionarios (
        nome
      )
    `)
    .order('data_realizacao', { ascending: false });

  if (error) {
    console.error('Erro ao buscar NRs:', error);
    return [];
  }
  return data.map(nr => ({
    ...nr,
    funcionarioNome: nr.funcionarios?.nome || 'Funcionário não encontrado'
  }));
};

export const getNrsByFuncionarioId = async (funcionarioId) => {
  const { data, error } = await supabase
    .from('supabase_nrs')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .order('data_realizacao', { ascending: false });
  if (error) {
    console.error('Erro ao buscar NRs do funcionário:', error);
    return [];
  }
  return data;
};

export const saveNr = async (nr) => {
  const nrData = {
    ...nr,
    atualizado_em: new Date().toISOString(),
  };
  
  if (nr.id) {
    const { data, error } = await supabase
      .from('supabase_nrs')
      .update(nrData)
      .eq('id', nr.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('supabase_nrs')
      .insert([{ ...nrData, criado_em: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const deleteNr = async (id) => {
  const { error } = await supabase
    .from('supabase_nrs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar NR:', error);
    throw error;
  }
  return true;
};