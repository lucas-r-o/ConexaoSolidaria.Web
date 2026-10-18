import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { DonationRequestDto } from './donation.dto';
import { DonationResponseDto } from './donation-response.dto';
import { RegistrationRequestDto } from './registration.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  register(request: RegistrationRequestDto): Observable<string> {
    return this.http.post(`${environment.apiUrl}/doacao`, request, { responseType: 'text' });
  }

  donate(donation: DonationRequestDto): Observable<DonationResponseDto> {
    const headers = this.authService.getAuthorizationHeader();
    return this.http.post<DonationResponseDto>(`${environment.apiUrl}/usuarios/doar`, donation, {
      headers,
    });
  }
}
