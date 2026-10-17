import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CampaignService } from '../../services/campaigns/campaign.service';
import { CreateCampaignRequestDto } from '../../services/campaigns/create-campaign.dto';

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
    title: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    description: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/\S/)]],
    financialGoal: [0, [Validators.required, Validators.min(0.01)]],
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
          const responseBody =
            typeof error === 'object' && error !== null && 'error' in error
              ? (error as { error?: { detail?: string; title?: string } | string }).error
              : null;
          const detail =
            typeof responseBody === 'string'
              ? responseBody
              : (responseBody?.detail ?? responseBody?.title);
          this.errorMessage.set(
            detail ?? 'Campaign creation failed. Check your permissions and try again.',
          );
        },
      });
  }
}
