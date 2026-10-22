import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { UpdateCampaignRequestDto } from '../../services/campaigns/update-campaign.dto';
import { PublicCampaignDto } from '../../services/campaigns/public-campaign.dto';
import { CampaignService } from '../../services/campaigns/campaign.service';
import { CampaignStatus } from '../../services/campaigns/campaign-status.enum';
import {
  CAMPAIGN_DESCRIPTION_VALIDATORS,
  CAMPAIGN_FINANCIAL_GOAL_VALIDATORS,
  CAMPAIGN_TITLE_VALIDATORS,
} from './campaign-form.validators';

@Component({
  selector: 'app-update-campaign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update-campaign.component.html',
  styleUrl: './update-campaign.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateCampaignComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly campaignService = inject(CampaignService);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly saveErrorMessage = signal('');
  readonly isSuccessful = signal(false);
  readonly campaignId = signal('');
  readonly campaign = signal<PublicCampaignDto | null>(null);
  readonly statusOptions = [
    { value: CampaignStatus.Active, label: 'Active' },
    { value: CampaignStatus.Completed, label: 'Completed' },
    { value: CampaignStatus.Canceled, label: 'Canceled' },
  ];

  readonly campaignForm = this.formBuilder.group({
    title: this.formBuilder.nonNullable.control('', CAMPAIGN_TITLE_VALIDATORS),
    description: this.formBuilder.nonNullable.control('', CAMPAIGN_DESCRIPTION_VALIDATORS),
    financialGoal: this.formBuilder.nonNullable.control(0, CAMPAIGN_FINANCIAL_GOAL_VALIDATORS),
    status: this.formBuilder.control<CampaignStatus | null>(null, Validators.required),
    endDate: this.formBuilder.nonNullable.control(''),
  });

  ngOnInit(): void {
    const campaignId = this.route.snapshot.paramMap.get('id')?.trim();
    if (campaignId) {
      this.findCampaignById(campaignId);
    }
  }

  findCampaignById(id: string): void {
    const campaignId = id.trim();
    if (!campaignId || this.isLoading() || this.isSaving()) {
      return;
    }

    this.campaignId.set(campaignId);
    this.campaign.set(null);
    this.errorMessage.set('');
    this.saveErrorMessage.set('');
    this.isSuccessful.set(false);
    this.isLoading.set(true);

    this.campaignService
      .getCampaign(campaignId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (campaign) => {
          this.campaign.set(campaign);
          this.campaignForm.reset({
            title: campaign.titulo ?? '',
            description: '',
            financialGoal: campaign.metaFinanceira ?? 0,
            status: null,
            endDate: '',
          });
        },
        error: (error: unknown) => {
          console.error('Failed to fetch campaign by ID', error);
          this.errorMessage.set('Could not load the campaign. Check the ID and try again.');
        },
      });
  }

  updateCampaign(): void {
    if (!this.campaign() || this.campaignForm.invalid || this.isSaving()) {
      this.campaignForm.markAllAsTouched();
      return;
    }

    const formValue = this.campaignForm.getRawValue();
    if (formValue.status === null) {
      this.campaignForm.controls.status.markAsTouched();
      return;
    }

    const request: UpdateCampaignRequestDto = {
      Titulo: formValue.title.trim(),
      Descricao: formValue.description.trim(),
      MetaFinanceira: formValue.financialGoal,
      Status: formValue.status,
      DataFim: formValue.endDate ? `${formValue.endDate}T00:00:00` : null,
    };

    this.saveErrorMessage.set('');
    this.isSuccessful.set(false);
    this.isSaving.set(true);

    this.campaignService
      .updateCampaign(this.campaignId(), request)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updatedCampaign) => {
          this.campaign.set(updatedCampaign);
          this.isSuccessful.set(true);
        },
        error: (error: unknown) => {
          console.error('Failed to update campaign', error);
          this.saveErrorMessage.set(
            'Could not update the campaign. Check your permissions and try again.',
          );
        },
      });
  }
}
