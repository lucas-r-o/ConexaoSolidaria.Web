import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { DoacaoResponse } from "./doacaoResponse";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { doacaoDto } from "./doacaoDto";
import { AuthService } from "../auth/AuthService";
import { CadastroDTO } from "./CadastroDTO";

@Injectable({ providedIn: 'root' })
export class UsuarioServices {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

    cadastrar(dto: CadastroDTO): Observable<unknown> {
        return this.http.post<unknown>(`${environment.apiUrl}/doadores`, dto);
    }

    doar(doacao: doacaoDto) : Observable<DoacaoResponse> {
        const headers = this.authService.getHeaderToken();
        return this.http.post<DoacaoResponse>(`${environment.apiUrl}/usuarios/doar`, doacao, { headers });
    }
}