import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CampaignService } from '../../services/campaigns/campaign.service';
import { CreateCampaignRequestDto } from '../../services/campaigns/create-campaign.dto';
import { extractHttpErrorMessage } from '../../shared/http-error-message';
import {
  CAMPAIGN_DESCRIPTION_VALIDATORS,
  CAMPAIGN_FINANCIAL_GOAL_VALIDATORS,
  CAMPAIGN_TITLE_VALIDATORS,
} from './campaign-form.validators';

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-campaign.component.html',
  styleUrl: './create-campaign.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCampaignComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly campaignService = inject(CampaignService);

  readonly isSubmitting = signal(false);
  readonly isSuccessful = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly campaignForm = this.formBuilder.nonNullable.group({
    title: ['', CAMPAIGN_TITLE_VALIDATORS],
    description: ['', CAMPAIGN_DESCRIPTION_VALIDATORS],
    financialGoal: [0, CAMPAIGN_FINANCIAL_GOAL_VALIDATORS],
    endDate: [''],
  });

  createCampaign(): void {
    if (this.campaignForm.invalid || this.isSubmitting()) {
      this.campaignForm.markAllAsTouched();
      return;
    }

    const formValue = this.campaignForm.getRawValue();
    const request: CreateCampaignRequestDto = {
      titulo: formValue.title.trim(),
      descricao: formValue.description.trim(),
      metaFinanceira: formValue.financialGoal,
      dataFim: formValue.endDate || null,
    };

    this.errorMessage.set(null);
    this.isSuccessful.set(false);
    this.isSubmitting.set(true);

    this.campaignService
      .createCampaign(request)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.isSuccessful.set(true);
          this.campaignForm.reset({ title: '', description: '', financialGoal: 0, endDate: '' });
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            extractHttpErrorMessage(error) ??
              'Campaign creation failed. Check your permissions and try again.',
          );
        },
      });
  }
}
