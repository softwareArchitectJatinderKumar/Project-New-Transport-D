import { Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { TransportComponent } from './transport/transport.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'transports', component: TransportComponent, canLoad: [authGuard] }
];
