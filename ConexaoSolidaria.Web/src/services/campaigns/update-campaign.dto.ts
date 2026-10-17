import { CampaignStatus } from './campaign-status.enum';

export interface UpdateCampaignRequestDto {
  Titulo: string;
  Descricao: string;
  MetaFinanceira: number;
  Status: CampaignStatus;
  DataFim: string | null;
}
