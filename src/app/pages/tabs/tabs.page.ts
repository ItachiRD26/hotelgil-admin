import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bedOutline, barChartOutline, logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [RouterLink, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet],
})
export class TabsPage {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ bedOutline, barChartOutline, logOutOutline });
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}

export default TabsPage;