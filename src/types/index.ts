export type PlanType = 'mensualidad' | 'tiquetera' | 'diario';
export type MemberStatus = 'activo' | 'por_vencer' | 'vencido';
export type UserRole = 'admin' | 'staff'; // admin: full access; staff: reception / trainer
export type PaymentMethod = 'Efectivo' | 'Transferencia / Nequi / Daviplata' | 'Tarjeta';

export interface Member {
  id: string;
  documentId: string; // Cédula / DNI
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  gender: 'M' | 'F' | 'Otro';
  planType: PlanType;
  status: MemberStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalCredits?: number; // for tiquetera (e.g. 12)
  remainingCredits?: number; // for tiquetera (e.g. 7)
  emergencyContact?: {
    name: string;
    phone: string;
  };
  notes?: string;
  createdAt: string;
  lastCheckIn?: string;
}

export interface CheckInRecord {
  id: string;
  memberId: string;
  memberName: string;
  documentId: string;
  planType: PlanType;
  timestamp: string; // ISO
  status: 'permitido' | 'denegado';
  reason?: string;
  remainingDays?: number;
  remainingCredits?: number;
}

export interface Product {
  id: string;
  name: string;
  category: 'Bebidas' | 'Suplementos' | 'Accesorios' | 'Snacks';
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  sku: string;
  image?: string;
  iconName?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO
  type: 'ingreso' | 'gasto';
  category: 'Membresía' | 'Tiquetera' | 'Pase Diario' | 'Tienda' | 'Mantenimiento' | 'Servicios' | 'Nómina' | 'Equipos' | 'Otros';
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  memberId?: string;
  memberName?: string;
  receiptNumber: string;
}

export interface AnthropometryRecord {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  heightCm: number;
  bodyFatPct: number;
  muscleMassKg: number;
  waistCm: number;
  chestCm: number;
  hipsCm: number;
  armCm: number;
  thighCm: number;
  bmi: number;
  bmiCategory: string;
  notes?: string;
}

export interface ExerciseItem {
  name: string;
  muscleGroup: 'Pecho' | 'Espalda' | 'Piernas' | 'Hombros' | 'Brazos' | 'Core' | 'Cardio';
  sets: number;
  reps: string; // "10-12" or "8"
  suggestedWeightKg?: string;
  restSeconds?: number;
  notes?: string;
}

export interface RoutineDay {
  dayName: string;
  exercises: ExerciseItem[];
}

export interface WorkoutRoutine {
  id: string;
  memberId: string;
  memberName?: string;
  name: string;
  goal: 'Hipertrofia' | 'Pérdida de Grasa' | 'Fuerza' | 'Resistencia' | 'Salud y Postura';
  days: RoutineDay[];
  assignedBy: string;
  assignedAt: string;
}

export interface GroupClass {
  id: string;
  name: string;
  category: 'Spinning' | 'CrossFit' | 'Yoga' | 'Funcional' | 'Boxeo' | 'Pilates';
  trainer: string;
  dayOfWeek: number; // 0=Dom, 1=Lun, ..., 6=Sab
  dayName: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
  color: string;
  enrolledMemberIds: string[];
}

export interface GymEquipment {
  id: string;
  name: string;
  category: 'Cardio' | 'Fuerza' | 'Peso Libre' | 'Accesorios';
  status: 'Operativo' | 'En mantenimiento' | 'Fuera de servicio';
  serialNumber: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  notes?: string;
}
