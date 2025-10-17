import { Injectable } from '@angular/core';

export interface UserToken {
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'transport_app_user';

  login(username: string, role: string) {
    const token: UserToken = { username, role };
    localStorage.setItem(this.storageKey, JSON.stringify(token));
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  getUser(): UserToken | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserToken;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }
}
