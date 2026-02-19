import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase.config';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener() {
    onAuthStateChanged(auth, (user) => {
      this.currentUserSubject.next(user);

      if (user) {
        localStorage.setItem('hotel_user', JSON.stringify({
          uid: user.uid,
          email: user.email
        }));
      } else {
        localStorage.removeItem('hotel_user');
      }
    });
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // ✅ Importantísimo en Android: setear estado INMEDIATO
      const user = userCredential.user;
      this.currentUserSubject.next(user);
      localStorage.setItem('hotel_user', JSON.stringify({
        uid: user.uid,
        email: user.email
      }));

      return user;
    } catch (error: any) {
      // 👇 devolvemos Error para que `error.message` exista
      throw new Error(this.handleAuthError(error));
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    localStorage.removeItem('hotel_user');
    this.currentUserSubject.next(null);
  }

  // ✅ Sin depender de auth.currentUser (Android timing)
  isAuthenticated(): boolean {
    return !!localStorage.getItem('hotel_user');
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  private handleAuthError(error: any): string {
    switch (error?.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Credenciales incorrectas';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde';
      case 'auth/network-request-failed':
        return 'Error de red. Verifica tu conexión';
      default:
        return 'Error al iniciar sesión';
    }
  }
}
