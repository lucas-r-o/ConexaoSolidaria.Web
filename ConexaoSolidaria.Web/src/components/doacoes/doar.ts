import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/AuthService';
import { CampanhaService } from '../../services/campanhas/campanhaServices';
import { CampanhaPublicaDTO } from '../../services/campanhas/CampanhaPublicaDTO';
import { UsuarioServices } from '../../services/usuarios/usuariosServices';
import { doacaoDto } from '../../services/usuarios/doacaoDto';

@Component({
    selector: 'app-doar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './doar.html',
    styleUrl: './doar.css',
})
export class Doar implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly campanhaService = inject(CampanhaService);
    private readonly usuarioService = inject(UsuarioServices);
    private readonly route = inject(ActivatedRoute);

    campanhas: CampanhaPublicaDTO[] = [];
    campanhaSelecionada: string | null = null;
    doacao: number = 0;
    mensagem: string | null = null;
    erro: string | null = null;
    loading = true;
    enviando = false;

    ngOnInit(): void {
        const campanhaInicial = this.route.snapshot.queryParamMap.get('campanha');
        this.campanhaService.getCampanhas().subscribe((data) => {
            this.campanhas = data;
            if (campanhaInicial && data.some((campanha) => campanha.id === campanhaInicial)) {
                this.campanhaSelecionada = campanhaInicial;
            }
            this.loading = false;
        });
    }

    enviar(): void {
        if (this.enviando || !this.campanhaSelecionada || !Number.isFinite(this.doacao) || this.doacao <= 0) {
            return;
        }

        const doadorId = this.authService.getTokenPayload()?.unique_name;
        if (!doadorId) {
            this.erro = 'Não foi possível identificar sua conta. Entre novamente para fazer uma doação.';
            return;
        }

        this.erro = null;
        this.mensagem = null;
        this.enviando = true;
        const doacao: doacaoDto = {
            campanhaId: this.campanhaSelecionada,
            doadorId,
            valor: this.doacao
        };

        this.usuarioService.doar(doacao).subscribe({
            next: (res) => {
                this.enviando = false;
                this.mensagem = res.mensagem;
            },
            error: (err) => {
                this.enviando = false;
                this.erro = err.error?.mensagem || 'Ocorreu um erro ao processar a doação.';
            }
        });
    }
}
