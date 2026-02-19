import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  refreshOutline,
  walletOutline,
  cardOutline,
  cashOutline,
  swapHorizontalOutline,
  bedOutline,
  documentTextOutline,
  menuOutline,
} from 'ionicons/icons';
import { HotelService } from '../../../../core/services/hotel.service';
import { MonthlyRevenue } from '../../../../core/models/hotel.models';

@Component({
  selector: 'app-revenue',
  templateUrl: './revenue.page.html',
  styleUrls: ['./revenue.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
  ],
})
export class RevenuePage implements OnInit {
  revenue: MonthlyRevenue | null = null;
  loading = false;
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  constructor(
    private hotelService: HotelService,
    private menuCtrl: MenuController,
  ) {
    addIcons({
      refreshOutline, walletOutline, cardOutline, cashOutline,
      swapHorizontalOutline, bedOutline, documentTextOutline, menuOutline,
    });
  }

  ngOnInit() {
    this.loadRevenue();
  }

  async openMenu() {
    await this.menuCtrl.open('main-menu');
  }

  async loadRevenue() {
    this.loading = true;
    try {
      this.revenue = await this.hotelService.getMonthlyRevenue(
        this.selectedMonth,
        this.selectedYear,
      );
    } catch (error) {
      console.error('Error loading revenue:', error);
    } finally {
      this.loading = false;
    }
  }

  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadRevenue();
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadRevenue();
  }

  getPercentage(amount: number): number {
    if (!this.revenue || this.revenue.total === 0) return 0;
    return Math.round((amount / this.revenue.total) * 100);
  }
}

export default RevenuePage;