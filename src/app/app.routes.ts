import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LoginAuthComponent } from './Authentication/login-auth/login-auth.component';
import { RegisterAuthComponent } from './Authentication/register-auth/register-auth.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { authenticationGuard } from './guards/authentication.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'restaurant-menu',
    pathMatch: 'full',
  },
  {
    path: 'restaurant-menu',
    component: HomeComponent,
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },


  {
    path: 'authentication',
    children: [
      {
        path: 'login',
        component: LoginAuthComponent,
        canActivate: [authenticationGuard],
      },
      {
        path: 'register',
        component: RegisterAuthComponent,
        canActivate: [authenticationGuard],
      },
    ],
  },

  {
    path: '**',
    component: NotFoundComponent,
  },
];
