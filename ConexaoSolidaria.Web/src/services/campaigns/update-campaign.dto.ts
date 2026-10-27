import { CampaignStatus } from './campaign-status.enum';

export interface UpdateCampaignRequestDto {
  Title: string;
  Description: string;
  FinancialGoal: number;
  Status: CampaignStatus;
  EndDate: string | null;
}
