import { Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { TransportComponent } from './transport/transport.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth/auth.guard';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'home', component: HomeComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'transports', component: TransportComponent, canLoad: [authGuard] }
];
