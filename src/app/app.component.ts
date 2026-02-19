import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bedOutline, barChartOutline, logOutOutline } from 'ionicons/icons';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
  ],
})
export class AppComponent {
  constructor(
    private auth: AuthService,
    private router: Router,
    private menuCtrl: MenuController
  ) {
    addIcons({ bedOutline, barChartOutline, logOutOutline });
  }

  async navigateTo(path: string) {
    await this.menuCtrl.close('main-menu');
    await this.router.navigate([path]);
  }

  async logout() {
    await this.menuCtrl.close('main-menu');
    try {
      await this.auth.logout();
    } catch (e) {
      console.log('Logout error:', e);
    }
    await this.router.navigate(['/login']);
  }
}