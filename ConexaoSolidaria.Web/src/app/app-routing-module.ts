import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from '../components/login/login';
import { Home } from '../components/home/home';
import { CriarCampanha } from '../components/campanhas/criar-campanha';
import { AuthGuard } from '../services/auth/authGuard';

const routes: Routes = [
  {
    path: "login",
    component: Login
  },
  {
    path: "campanhas/criar",
    component: CriarCampanha,
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
