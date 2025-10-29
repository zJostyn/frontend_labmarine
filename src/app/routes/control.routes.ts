import { Routes } from '@angular/router';

export const controlRoutes: Routes = [
  {
    path: 'control',
    children: [
      {
        path: 'bodega',
        data: { title: 'Control de Bodega' },
        loadComponent: () =>
          import('../components/dashboard/control/bodega/bodega.page')
            .then(m => m.BodegaPage),
        //canActivate: [EstudianteGuard]
      }
    ]
  },
];
