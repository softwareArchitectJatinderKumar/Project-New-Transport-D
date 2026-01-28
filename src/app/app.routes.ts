import { Routes } from '@angular/router';
import { TransportComponent } from './transport/transport.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'home', component: HomeComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
	{ path: 'profile', component: ProfileComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'transports', component: TransportComponent, canActivate: [authGuard] }
];
