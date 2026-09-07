import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from '../components/login/login';
import { Home } from '../components/home/home';

const routes: Routes = [
  {
    path: "login",
    component: Login
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
