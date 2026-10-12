import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from '../components/login/login';
import { Home } from '../components/home/home';
import { CriarCampanha } from '../components/campanhas/criar-campanha';
import { AtualizarCampanha } from '../components/campanhas/atualizar-campanha';
import { Doar } from '../components/doacoes/doar';
import { AuthGuard } from '../services/auth/authGuard';

const routes: Routes = [
  {
    path: "login",
    component: Login
  },
  {
    path: "doar",
    component: Doar,
    canActivate: [AuthGuard]
  },
  {
    path: "campanhas/criar",
    component: CriarCampanha,
    canActivate: [AuthGuard]
  },
  {
    path: "campanhas/atualizar",
    component: AtualizarCampanha,
    canActivate: [AuthGuard]
  },
  {
    path: "campanhas/atualizar/:id",
    component: AtualizarCampanha,
    canActivate: [AuthGuard]
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
