import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { controlRoutes } from './routes/control.routes';

const routes: Routes = [
  {
    path: 'main',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./components/dashboard/home/home.page').then(m => m.HomePage),
        data: { title: 'LABMARINE SAS' },
      },
      ...controlRoutes,

      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.page').then(m => m.LoginPage),
    canActivate: [LoginGuard]
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
