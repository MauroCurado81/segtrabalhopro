import { supabase } from './supabaseClient';
import { calcularValidadeAso } from '@/lib/data-utils';

export const getAsos = async () => {
  const { data, error } = await supabase
    .from('supabase_asos')
    .select(`
      *,
      funcionarios (
        nome
      )
    `)
    .order('data_emissao', { ascending: false });

  if (error) {
    console.error('Erro ao buscar ASOs:', error);
    return [];
  }
  return data.map(aso => ({
    ...aso,
    funcionarioNome: aso.funcionarios?.nome || 'Funcionário não encontrado'
  }));
};

export const getHistoricoAsos = async () => {
  const { data, error } = await supabase
    .from('supabase_historico_asos')
    .select(`
      *,
      funcionarios (
        nome
      )
    `)
    .order('data_emissao', { ascending: false });
  if (error) {
    console.error('Erro ao buscar histórico de ASOs:', error);
    return [];
  }
  return data.map(aso => ({
    ...aso,
    funcionarioNome: aso.funcionarios?.nome || 'Funcionário não encontrado'
  }));
};

export const getAsosByFuncionarioId = async (funcionarioId) => {
  const { data, error } = await supabase
    .from('supabase_asos')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .order('data_emissao', { ascending: false });
  if (error) {
    console.error('Erro ao buscar ASOs do funcionário:', error);
    return [];
  }
  return data;
};

export const getHistoricoAsosByFuncionarioId = async (funcionarioId) => {
  const { data, error } = await supabase
    .from('supabase_historico_asos')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .order('data_emissao', { ascending: false });
  if (error) {
    console.error('Erro ao buscar histórico de ASOs do funcionário:', error);
    return [];
  }
  return data;
};

export const saveAso = async (asoData) => {
  const novoAso = { ...asoData };
  novoAso.data_validade = calcularValidadeAso(novoAso.data_emissao);
  novoAso.atualizado_em = new Date().toISOString();

  if (novoAso.id) { 
    const { data: asoExistente, error: fetchError } = await supabase
      .from('supabase_asos')
      .select('*')
      .eq('id', novoAso.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { 
      console.error('Erro ao buscar ASO para atualização (ativo):', fetchError);
      throw fetchError;
    }
    
    if (asoExistente) {
       const { data, error } = await supabase
        .from('supabase_asos')
        .update({
          tipo: novoAso.tipo,
          data_emissao: novoAso.data_emissao,
          data_validade: novoAso.data_validade,
          medico: novoAso.medico,
          crm: novoAso.crm,
          observacoes: novoAso.observacoes,
          atualizado_em: novoAso.atualizado_em,
        })
        .eq('id', novoAso.id)
        .select()
        .single();
        if (error) throw error;
        return data;
    } else {
      const { data: historicoExistente, error: fetchHistoricoError } = await supabase
        .from('supabase_historico_asos')
        .select('*')
        .eq('id', novoAso.id) 
        .single();
      
      if (fetchHistoricoError && fetchHistoricoError.code !== 'PGRST116') {
        console.error('Erro ao buscar ASO para atualização (histórico):', fetchHistoricoError);
        throw fetchHistoricoError;
      }

      if (historicoExistente) {
        const { data, error } = await supabase
          .from('supabase_historico_asos')
          .update({
            tipo: novoAso.tipo,
            data_emissao: novoAso.data_emissao,
            data_validade: novoAso.data_validade,
            medico: novoAso.medico,
            crm: novoAso.crm,
            observacoes: novoAso.observacoes,
            atualizado_em: novoAso.atualizado_em,
          })
          .eq('id', novoAso.id)
          .select()
          .single();
          if (error) throw error;
          return data;
      } else {
        console.error('ASO não encontrado para atualização (nem ativo, nem histórico).');
        throw new Error('ASO não encontrado para atualização.');
      }
    }

  } else {
    const { data: asoAtivoExistente, error: fetchAtivoError } = await supabase
      .from('supabase_asos')
      .select('*')
      .eq('funcionario_id', novoAso.funcionario_id)
      .single();
    
    if (fetchAtivoError && fetchAtivoError.code !== 'PGRST116') {
        console.error('Erro ao verificar ASO ativo existente:', fetchAtivoError);
        throw fetchAtivoError;
    }

    if (asoAtivoExistente) {
      const historicoEntry = {
        ...asoAtivoExistente,
        status: 'substituido',
        aso_original_id: asoAtivoExistente.id, 
        id: undefined, 
        criado_em: asoAtivoExistente.criado_em, 
        atualizado_em: new Date().toISOString(),
      };
      delete historicoEntry.funcionarios;

      const { error: insertHistoricoError } = await supabase
        .from('supabase_historico_asos')
        .insert([historicoEntry]);
      if (insertHistoricoError) {
        console.error('Erro ao mover ASO para histórico:', insertHistoricoError);
        throw insertHistoricoError;
      }

      const { error: deleteAtivoError } = await supabase
        .from('supabase_asos')
        .delete()
        .eq('id', asoAtivoExistente.id);
      if (deleteAtivoError) {
        console.error('Erro ao deletar ASO ativo antigo:', deleteAtivoError);
        throw deleteAtivoError;
      }
    }
    
    const asoToInsert = {
      funcionario_id: novoAso.funcionario_id,
      tipo: novoAso.tipo,
      data_emissao: novoAso.data_emissao,
      data_validade: novoAso.data_validade,
      medico: novoAso.medico,
      crm: novoAso.crm,
      observacoes: novoAso.observacoes,
      status: 'valido',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('supabase_asos')
      .insert([asoToInsert])
      .select()
      .single();
    if (error) {
        console.error('Erro ao inserir novo ASO:', error);
        throw error;
    }
    return data;
  }
};

export const deleteAso = async (id) => {
  let error = null;

  const { error: deleteActiveError } = await supabase
    .from('supabase_asos')
    .delete()
    .eq('id', id);
  
  if (deleteActiveError && deleteActiveError.code !== 'PGRST116') { 
    error = deleteActiveError;
  }

  if (!error || (deleteActiveError && deleteActiveError.details.includes("0 rows"))) {
    const { error: deleteHistoricError } = await supabase
      .from('supabase_historico_asos')
      .delete()
      .eq('id', id); 
    if (deleteHistoricError && deleteHistoricError.code !== 'PGRST116') {
      error = deleteHistoricError;
    }
  }
  
  if (error) {
    console.error('Erro ao deletar ASO:', error);
    throw error;
  }
  return true;
};