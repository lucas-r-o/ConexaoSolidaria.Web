export interface CreateCampaignRequestDto {
  titulo: string;
  descricao: string;
  metaFinanceira: number;
  dataFim: string | null;
}
