import { Injectable } from '@angular/core';
import { ref, get } from 'firebase/database';
import { db } from './firebase.config';
import { Reservation, Room, RoomWithStatus, RoomStatus, MonthlyRevenue } from '../models/hotel.models';
import { HOTEL_ROOMS } from '../data/rooms.data';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  
  getAllRooms(): Room[] {
    return HOTEL_ROOMS;
  }

  async getAllReservations(): Promise<Reservation[]> {
    const reservationsRef = ref(db, 'reservations');
    const snapshot = await get(reservationsRef);
    
    if (!snapshot.exists()) return [];
    
    const reservationsData = snapshot.val();
    return Object.values(reservationsData) as Reservation[];
  }

  async getRoomsWithStatus(date: Date = new Date()): Promise<RoomWithStatus[]> {
    const rooms = this.getAllRooms();
    const reservations = await this.getAllReservations();

    // Usar fecha directamente sin conversión de zona horaria
    const dateStr = this.formatDate(date);

    return rooms.map(room => {
      // Buscar todas las reservas activas para esta habitación en la fecha especificada
      const activeReservations = reservations.filter(res => {
        const hasRoom = res.rooms.some((r: any) => r.roomNumber === room.roomNumber);
        if (!hasRoom) return false;
        
        // Verificar si la fecha está dentro del rango de la reserva
        if (res.checkinDate && res.checkoutDate) {
          return this.isDateInRange(dateStr, res.checkinDate, res.checkoutDate);
        }
        return true;
      });

      let status: RoomStatus = 'disponible';
      let reservation: Reservation | undefined = undefined;
      
      if (activeReservations.length > 0) {
        // Prioridad: 1) checkin (ocupada), 2) reservada (sin stayStatus), 3) checkout (disponible)
        const checkinReservation = activeReservations.find(r => r.stayStatus === 'checkin');
        const reservedReservation = activeReservations.find(r => !r.stayStatus);
        const checkoutReservation = activeReservations.find(r => r.stayStatus === 'checkout');
        
        if (checkinReservation) {
          status = 'ocupada';
          reservation = checkinReservation;
        } else if (reservedReservation) {
          status = 'reservada';
          reservation = reservedReservation;
        } else if (checkoutReservation) {
          status = 'disponible';
          reservation = checkoutReservation;
        }
      }

      return {
        ...room,
        status,
        reservation
      };
    });
  }

async getMonthlyRevenue(month: number, year: number): Promise<MonthlyRevenue> {
  const reservations = await this.getAllReservations();
  const facturas = await this.getAllFacturas();

  // ✅ FIX Android: parse seguro para YYYY-MM-DD
  const monthReservations = reservations.filter(res => {
    if (!res.checkinDate) return false;

    const checkinDate = this.safeParseYMD(res.checkinDate); // <- FIX
    return checkinDate.getMonth() === month && checkinDate.getFullYear() === year;
  });

  // createdAt viene ISO => ok, pero lo protegemos igual
  const monthFacturas = facturas.filter((f: any) => {
    if (!f?.createdAt) return false;
    const date = new Date(f.createdAt);
    return !isNaN(date.getTime()) && date.getMonth() === month && date.getFullYear() === year;
  });

  // ✅ TOTAL: si tu quieres (cobrado + pendiente)
  const total = monthReservations.reduce((sum, res) => {
    const paid = Number(res.amountPaid || 0);
    const pending = Number(res.remaining || 0);
    return sum + paid + pending;
  }, 0);

  // ✅ Métodos: normalizamos (Efectivo/Tarjeta/Transferencia)
  const cash = this.sumByPaymentMethod(monthReservations, 'efectivo');
  const card = this.sumByPaymentMethod(monthReservations, 'tarjeta');
  const transfer = this.sumByPaymentMethod(monthReservations, 'transferencia');

  // ✅ FIX: FiscalCount real (tus facturas no tienen type="fiscal")
  const fiscalCount = monthFacturas.filter((f: any) =>
    f?.fiscalData?.includeTax === true || !!f?.invoiceId
  ).length;

  // ✅ Conteo de habitaciones vendidas por tipo
  const allRooms: any[] = [];
  monthReservations.forEach((res: Reservation) => {
    if (Array.isArray(res.rooms)) allRooms.push(...res.rooms);
  });

  const totalRoomsSold = allRooms.length;
  const sencillaCount = allRooms.filter(r => String(r?.roomType || '').toLowerCase() === 'sencilla').length;
  const dobleCount = allRooms.filter(r => String(r?.roomType || '').toLowerCase() === 'doble').length;
  const tripleCount = allRooms.filter(r => String(r?.roomType || '').toLowerCase() === 'triple').length;

  return {
    total,
    cash,
    card,
    transfer,
    fiscalCount,
    totalRoomsSold,
    sencillaCount,
    dobleCount,
    tripleCount,
    month: this.getMonthName(month),
    year
  };
}

  async getAllFacturas(): Promise<any[]> {
    const facturasRef = ref(db, 'facturas');
    const snapshot = await get(facturasRef);
    
    if (!snapshot.exists()) return [];
    
    const facturasData = snapshot.val();
    return Object.values(facturasData);
  }

  private safeParseYMD(ymd: string): Date {
  // ymd: "YYYY-MM-DD"
  // Android-safe: "YYYY-MM-DDT00:00:00"
  const d = new Date(`${ymd}T00:00:00`);
  if (!isNaN(d.getTime())) return d;

  // fallback ultra safe:
  const [y, m, day] = ymd.split('-').map(n => Number(n));
  return new Date(y, (m || 1) - 1, day || 1);
}

private sumByPaymentMethod(reservations: Reservation[], method: 'efectivo' | 'tarjeta' | 'transferencia'): number {
  return reservations
    .filter(r => String(r.paymentMethod || '').toLowerCase() === method)
    .reduce((sum, r) => sum + Number(r.amountPaid || 0) + Number(r.remaining || 0), 0);
}


  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isDateInRange(date: string, startDate: string, endDate: string): boolean {
    return date >= startDate && date <= endDate;
  }

  private getMonthName(month: number): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month];
  }
}
