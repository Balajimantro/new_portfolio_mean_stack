import { Routes } from '@angular/router';
import { PortfolioPageComponent } from './pages/portfolio-page/portfolio-page.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  { path: '', component: PortfolioPageComponent },
  {
    path: 'admin',
    children: [
      { path: 'login', component: AdminLoginComponent, canActivate: [loginGuard] },
      { path: 'panel', component: AdminPanelComponent, canActivate: [authGuard] },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  },
  { path: '**', redirectTo: '' }
];
