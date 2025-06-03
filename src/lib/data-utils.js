import { format, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; 
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

export const calcularDiasRestantes = (dataFinal) => {
  if (!dataFinal) return null;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const dataFim = new Date(dataFinal);
  if (isNaN(dataFim.getTime())) return null;
  dataFim.setHours(0, 0, 0, 0);
  
  const diferenca = dataFim.getTime() - hoje.getTime();
  return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
};

export const calcularValidadeAso = (dataEmissao) => {
  if (!dataEmissao) return "";
  const data = new Date(dataEmissao);
  if (isNaN(data.getTime())) return "";
  const dataValidade = addYears(data, 1);
  return format(dataValidade, 'yyyy-MM-dd');
};