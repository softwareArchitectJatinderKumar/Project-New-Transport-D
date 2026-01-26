import { Routes } from '@angular/router';
import { TransportComponent } from './transport/transport.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
	{ path: 'profile', component: ProfileComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'transports', component: TransportComponent, canActivate: [authGuard] }
];
