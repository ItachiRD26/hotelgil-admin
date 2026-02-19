import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
  ) {}

  async onLogin() {
    if (!this.email || !this.password) {
      await this.showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    this.loading = true;
    const email = this.email.trim();
    const password = this.password;

    try {
      await this.authService.login(email, password);
      await this.router.navigate(['/tabs/rooms']);
    } catch (error: any) {
      await this.showToast(error?.message || 'Error al iniciar sesión', 'danger');
    } finally {
      this.loading = false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}

export default LoginPage;