import { Status } from './Status';

export interface AtualizarCampanhaDTO {
  Titulo: string;
  Descricao: string;
  MetaFinanceira: number;
  Status: Status;
  DataFim: string | null;
}