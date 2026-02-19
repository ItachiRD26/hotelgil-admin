export type RoomType = 'Sencilla' | 'Doble' | 'Triple' | 'VIP';
export type StayStatus = 'checkin' | 'checkout';
export type PaymentStatus = 'parcial' | 'pagado';

export interface ReservedRoom {
  roomNumber: string;
  roomType: RoomType;
  price: number;
}

export interface Reservation {
  reservationId: string;
  guestName: string;
  rooms: ReservedRoom[];
  stayStatus?: StayStatus;
  checkinDate?: string;
  checkoutDate?: string;
  checkinTime?: string;
  checkoutTime?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  amountPaid?: number;
  totalPrice?: number;
  remaining?: number;
}

export interface Room {
  roomNumber: string;
  roomType: RoomType;
  price: number;
}

export type RoomStatus = 'disponible' | 'reservada' | 'ocupada';

export interface RoomWithStatus extends Room {
  status: RoomStatus;
  reservation?: Reservation;
}

export interface MonthlyRevenue {
  total: number;
  cash: number;
  card: number;
  transfer: number;
  fiscalCount: number;
  totalRoomsSold: number;
  sencillaCount: number;
  dobleCount: number;
  tripleCount: number;
  month: string;
  year: number;
}
