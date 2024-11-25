import { RouterModule, Routes } from '@angular/router';
import { ConnectComponent } from './connect/connect.component';
import { NgModule } from '@angular/core';
import { ProgramComponent } from './program/program.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'connect', pathMatch: 'full' }, // Default route
  { path: 'connect', component: ConnectComponent }, // Route for ConnectComponent
  { path: 'program', component: ProgramComponent, canActivate: [AuthGuard] }, // Route for programComponent
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
