import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonIcon,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonBadge,
  IonSpinner,
  RefresherCustomEvent,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  refreshOutline,
  chevronBackOutline,
  chevronForwardOutline,
  menuOutline,
} from 'ionicons/icons';
import { HotelService } from '../../../../core/services/hotel.service';
import { RoomWithStatus } from '../../../../core/models/hotel.models';

type RoomFilter = 'all' | 'disponible' | 'reservada' | 'ocupada';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.page.html',
  styleUrls: ['./rooms.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonBadge,
    IonSpinner,
  ],
})
export class RoomsPage implements OnInit {
  rooms: RoomWithStatus[] = [];
  filteredRooms: RoomWithStatus[] = [];
  loading = false;
  selectedFilter: RoomFilter = 'all';
  selectedDate: Date = new Date();
  lastUpdate: Date = new Date();

  constructor(
    private hotelService: HotelService,
    private menuCtrl: MenuController,
  ) {
    addIcons({ refreshOutline, chevronBackOutline, chevronForwardOutline, menuOutline });
  }

  ngOnInit() {
    this.loadRooms();
  }

  async openMenu() {
    await this.menuCtrl.open('main-menu');
  }

  async loadRooms() {
    this.loading = true;
    try {
      this.rooms = await this.hotelService.getRoomsWithStatus(this.selectedDate);
      this.applyFilter(this.selectedFilter);
      this.lastUpdate = new Date();
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      this.loading = false;
    }
  }

  changeDate(days: number) {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + days);
    this.selectedDate = newDate;
    this.loadRooms();
  }

  goToToday() {
    this.selectedDate = new Date();
    this.loadRooms();
  }

  getFormattedDate(): string {
    return this.selectedDate.toLocaleDateString('es-DO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  isToday(): boolean {
    return this.selectedDate.toDateString() === new Date().toDateString();
  }

  async handleRefresh(event: RefresherCustomEvent) {
    await this.loadRooms();
    event.target.complete();
  }

  setFilter(filter: RoomFilter) {
    this.applyFilter(filter);
  }

  applyFilter(filter: RoomFilter) {
    this.selectedFilter = filter;
    this.filteredRooms = filter === 'all'
      ? [...this.rooms]
      : this.rooms.filter(r => r.status === filter);
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      disponible: 'success', reservada: 'warning', ocupada: 'danger',
    };
    return map[status] ?? 'medium';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      disponible: 'Disponible', reservada: 'Reservada', ocupada: 'Ocupada',
    };
    return map[status] ?? status;
  }

  getStatsCount(status: string): number {
    return this.rooms.filter(r => r.status === status).length;
  }
}