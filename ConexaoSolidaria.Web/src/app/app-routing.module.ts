import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../components/login/login.component';
import { HomeComponent } from '../components/home/home.component';
import { CreateCampaignComponent } from '../components/campaigns/create-campaign.component';
import { UpdateCampaignComponent } from '../components/campaigns/update-campaign.component';
import { DonationComponent } from '../components/donations/donation.component';
import { authenticationGuard, roleGuard } from '../services/auth/auth.guard';
import { RegistrationComponent } from '../components/registration/registration.component';
import { UserRole } from '../services/auth/auth.service';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegistrationComponent,
  },
  {
    path: 'users/create-manager',
    component: RegistrationComponent,
    canActivate: [authenticationGuard, roleGuard],
    data: { role: UserRole.OrganizationManager, managerCreation: true },
  },
  {
    path: 'donate',
    component: DonationComponent,
    canActivate: [authenticationGuard, roleGuard],
    data: { role: UserRole.Donor },
  },
  {
    path: 'campaigns/create',
    component: CreateCampaignComponent,
    canActivate: [authenticationGuard, roleGuard],
    data: { role: UserRole.OrganizationManager },
  },
  {
    path: 'campaigns/update',
    component: UpdateCampaignComponent,
    canActivate: [authenticationGuard, roleGuard],
    data: { role: UserRole.OrganizationManager },
  },
  {
    path: 'campaigns/update/:id',
    component: UpdateCampaignComponent,
    canActivate: [authenticationGuard, roleGuard],
    data: { role: UserRole.OrganizationManager },
  },
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
