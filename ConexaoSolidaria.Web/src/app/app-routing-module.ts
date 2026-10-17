import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from '../components/login/login';
import { Home } from '../components/home/home';
import { CriarCampanha } from '../components/campanhas/criar-campanha';
import { AtualizarCampanha } from '../components/campanhas/atualizar-campanha';
import { Doar } from '../components/doacoes/doar';
import { AuthGuard, RoleGuard } from '../services/auth/authGuard';
import { Cadastro } from '../components/cadastro/cadastro';
import { UserRole } from '../services/auth/AuthService';

const routes: Routes = [
  {
    path: "login",
    component: Login
  },
  {
    path: "cadastro",
    component: Cadastro
  },
  {
    path: "doar",
    component: Doar,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.Doador }
  },
  {
    path: "campanhas/criar",
    component: CriarCampanha,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.GestorOng }
  },
  {
    path: "campanhas/atualizar",
    component: AtualizarCampanha,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.GestorOng }
  },
  {
    path: "campanhas/atualizar/:id",
    component: AtualizarCampanha,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: UserRole.GestorOng }
  },
  {
    path: "",
    component: Home
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
