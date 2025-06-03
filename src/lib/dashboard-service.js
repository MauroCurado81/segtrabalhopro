import { getFuncionarios } from '@/lib/funcionarios-service';
import { getAsos } from '@/lib/asos-service';
import { getNrs } from '@/lib/nrs-service';
import { getEpis } from '@/lib/epis-service';
import { calcularDiasRestantes, formatDate } from '@/lib/data-utils';

export const getItensExpirando = async () => {
  const funcionarios = await getFuncionarios();
  const asos = await getAsos();
  const nrs = await getNrs();
  const epis = await getEpis();
  
  const mapItemComFuncionario = (item, tipo) => {
    const funcionario = funcionarios.find(f => f.id === item.funcionarioId);
    const diasRestantes = calcularDiasRestantes(item.dataValidade);
    
    return {
      id: item.id,
      tipo: tipo === 'aso' ? item.tipo : undefined,
      descricao: tipo !== 'aso' ? (item.numero || item.nome) : undefined,
      funcionario: funcionario ? funcionario.nome : 'Funcionário não encontrado',
      validade: formatDate(item.dataValidade),
      diasRestantes
    };
  };
  
  const asosComFuncionario = asos.map(aso => mapItemComFuncionario(aso, 'aso'));
  const nrsComFuncionario = nrs.map(nr => mapItemComFuncionario(nr, 'nr'));
  const episComFuncionario = epis.map(epi => mapItemComFuncionario(epi, 'epi'));
  
  const filterAndSortExpirando = (items) => 
    items
      .filter(item => item.diasRestantes !== null && item.diasRestantes < 60)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  
  return {
    asos: filterAndSortExpirando(asosComFuncionario),
    nrs: filterAndSortExpirando(nrsComFuncionario),
    epis: filterAndSortExpirando(episComFuncionario)
  };
};

export const getEstatisticas = async () => {
  const funcionarios = await getFuncionarios();
  const asos = await getAsos();
  const nrs = await getNrs();
  const epis = await getEpis();
  
  const funcionariosAtivos = funcionarios.filter(f => f.status === 'ativo').length;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const countExpirados = (items) => 
    items.filter(item => {
      if (!item.dataValidade) return false;
      const dataValidade = new Date(item.dataValidade);
      return dataValidade < hoje;
    }).length;

  const countExpirandoEm30Dias = (items) =>
    items.filter(item => {
      if (!item.dataValidade) return false;
      const diasRestantes = calcularDiasRestantes(item.dataValidade);
      return diasRestantes >= 0 && diasRestantes <= 30;
    }).length;

  const asosExpirados = countExpirados(asos);
  const nrsExpirados = countExpirados(nrs);
  const episExpirados = countExpirados(epis);
  
  const asosExpirando = countExpirandoEm30Dias(asos);
  const nrsExpirando = countExpirandoEm30Dias(nrs);
  const episExpirando = countExpirandoEm30Dias(epis);
  
  return {
    funcionariosAtivos,
    totalAsos: asos.length,
    totalNrs: nrs.length,
    totalEpis: epis.length,
    asosExpirados,
    nrsExpirados,
    episExpirados,
    asosExpirando,
    nrsExpirando,
    episExpirando,
    totalExpirando: asosExpirando + nrsExpirando + episExpirando,
    totalExpirados: asosExpirados + nrsExpirados + episExpirados
  };
};