export interface CreateCampaignRequestDto {
  Title: string;
  Description: string;
  FinancialGoal: number;
  EndDate: string | null;
}
