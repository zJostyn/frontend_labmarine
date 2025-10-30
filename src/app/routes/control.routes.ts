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
      },
      {
        path: 'piscinas',
        data: { title: 'Registro de Piscinas' },
        loadComponent: () =>
          import('../components/dashboard/control/piscinas/piscinas.page')
            .then(m => m.PiscinasPage),
      },
      {
        path: 'larvas',
        data: { title: 'Registro de los Lotes de Larvas' },
        loadComponent: () =>
          import('../components/dashboard/control/larvas/larvas.page')
            .then(m => m.LarvasPage),
      },
      {
        path: 'corridas',
        data: { title: 'Registro de Corridas' },
        loadComponent: () =>
          import('../components/dashboard/control/corridas/corridas.page')
            .then(m => m.CorridasPage),
      }
    ]
  },
];
