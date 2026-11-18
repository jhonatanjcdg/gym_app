import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Member,
  CheckInRecord,
  Product,
  CartItem,
  Transaction,
  AnthropometryRecord,
  WorkoutRoutine,
  GroupClass,
  GymEquipment,
  UserRole,
  PaymentMethod,
  PlanType,
} from '../types';
import {
  SEED_MEMBERS,
  SEED_CHECKINS,
  SEED_PRODUCTS,
  SEED_TRANSACTIONS,
  SEED_ANTHROPOMETRY,
  SEED_ROUTINES,
  SEED_CLASSES,
  SEED_EQUIPMENT,
} from '../data/seedData';
import {
  playAccessGrantedSound,
  playAccessDeniedSound,
  playCashSound,
  setSoundEnabled as setAudioSoundEnabled,
} from '../utils/audio';
import { calculateBMI, calculateMemberStatus, getDaysRemaining } from '../utils/formatters';
import {
  exportGymToExcel,
  exportGymToJson,
  FullGymBackupData,
} from '../utils/excel';
import {
  CloudSnapshot,
  CloudConfig,
  getCloudConfig,
  saveCloudConfig,
  getCloudSnapshots,
  executeCloudSync,
} from '../services/cloudSync';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface CheckInResult {
  success: boolean;
  member?: Member;
  record: CheckInRecord;
  message: string;
}

interface GymContextType {
  // States
  members: Member[];
  checkIns: CheckInRecord[];
  products: Product[];
  transactions: Transaction[];
  anthropometry: AnthropometryRecord[];
  routines: WorkoutRoutine[];
  classes: GroupClass[];
  equipment: GymEquipment[];
  currentRole: UserRole;
  soundEnabled: boolean;
  toasts: ToastMessage[];

  // Cloud & Local Backup States
  isSyncingCloud: boolean;
  cloudSyncStatus: 'synced' | 'pending' | 'syncing' | 'error';
  lastSyncedAt: string | null;
  pendingChangesCount: number;
  cloudSnapshots: CloudSnapshot[];
  cloudConfig: CloudConfig;

  // Setters & Role
  setCurrentRole: (role: UserRole) => void;
  setSoundEnabled: (enabled: boolean) => void;
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Actions
  processCheckIn: (documentOrId: string) => CheckInResult;
  addMember: (data: Omit<Member, 'id' | 'createdAt' | 'status'>, initialPayment?: { amount: number; paymentMethod: PaymentMethod }) => Member;
  updateMember: (id: string, data: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  renewMembership: (params: {
    memberId: string;
    planType: PlanType;
    durationDays?: number;
    creditsToAdd?: number;
    amount: number;
    paymentMethod: PaymentMethod;
  }) => void;
  registerDailyPass: (params: {
    name: string;
    documentId: string;
    phone: string;
    amount: number;
    paymentMethod: PaymentMethod;
  }) => Member;
  sellProducts: (items: CartItem[], paymentMethod: PaymentMethod, customerName?: string) => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'receiptNumber'>) => void;
  addAnthropometry: (data: Omit<AnthropometryRecord, 'id' | 'bmi' | 'bmiCategory'>) => void;
  saveRoutine: (routine: WorkoutRoutine) => void;
  toggleEnrollClass: (classId: string, memberId: string) => boolean;
  updateEquipment: (id: string, data: Partial<GymEquipment>) => void;
  resetToSeedData: () => void;

  // Local & Cloud Sync Actions
  exportToExcel: () => void;
  exportToJson: () => void;
  restoreFromBackup: (backup: FullGymBackupData) => void;
  syncToCloud: () => Promise<boolean>;
  updateCloudConfig: (config: CloudConfig) => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'titan_pulse_gym_';

export const GymProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Members
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}members`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_MEMBERS;
      }
    }
    return SEED_MEMBERS;
  });

  // Check-ins
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}checkins`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_CHECKINS;
      }
    }
    return SEED_CHECKINS;
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}products`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_PRODUCTS;
      }
    }
    return SEED_PRODUCTS;
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}transactions`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_TRANSACTIONS;
      }
    }
    return SEED_TRANSACTIONS;
  });

  // Anthropometry
  const [anthropometry, setAnthropometry] = useState<AnthropometryRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}anthropometry`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_ANTHROPOMETRY;
      }
    }
    return SEED_ANTHROPOMETRY;
  });

  // Routines
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}routines`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_ROUTINES;
      }
    }
    return SEED_ROUTINES;
  });

  // Classes
  const [classes, setClasses] = useState<GroupClass[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}classes`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_CLASSES;
      }
    }
    return SEED_CLASSES;
  });

  // Equipment
  const [equipment, setEquipment] = useState<GymEquipment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}equipment`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_EQUIPMENT;
      }
    }
    return SEED_EQUIPMENT;
  });

  // App Role & Audio
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [soundEnabled, setSoundState] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Cloud & Backup States
  const [cloudConfig, setCloudConfigState] = useState<CloudConfig>(() => getCloudConfig());
  const [cloudSnapshots, setCloudSnapshots] = useState<CloudSnapshot[]>(() => getCloudSnapshots());
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'error'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    const snaps = getCloudSnapshots();
    return snaps[0]?.timestamp || new Date().toISOString();
  });
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);

  const recordLocalChange = () => {
    setPendingChangesCount(prev => prev + 1);
    setCloudSyncStatus('pending');
  };

  // Sound handler
  const setSoundEnabled = (enabled: boolean) => {
    setSoundState(enabled);
    setAudioSoundEnabled(enabled);
  };

  // Toast System
  const showToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}checkins`, JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}anthropometry`, JSON.stringify(anthropometry));
  }, [anthropometry]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}routines`, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}classes`, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}equipment`, JSON.stringify(equipment));
  }, [equipment]);

  // Dynamic recalculation of member status
  useEffect(() => {
    setMembers(prev =>
      prev.map(m => {
        const calculated = calculateMemberStatus(m);
        if (m.status !== calculated.status) {
          return { ...m, status: calculated.status };
        }
        return m;
      })
    );
  }, []);

  /**
   * Process Check-in Terminal Logic (Audio + Visual Alert)
   */
  const processCheckIn = (documentOrId: string): CheckInResult => {
    const trimmed = documentOrId.trim();
    if (!trimmed) {
      const rec: CheckInRecord = {
        id: `CHK-${Date.now()}`,
        memberId: 'UNKNOWN',
        memberName: 'Desconocido',
        documentId: trimmed,
        planType: 'mensualidad',
        timestamp: new Date().toISOString(),
        status: 'denegado',
        reason: 'Número de documento o código vacío.',
      };
      playAccessDeniedSound();
      return { success: false, record: rec, message: 'Ingrese un número de documento válido' };
    }

    const member = members.find(
      m => m.documentId.toLowerCase() === trimmed.toLowerCase() || m.id.toLowerCase() === trimmed.toLowerCase()
    );

    const nowIso = new Date().toISOString();

    if (!member) {
      playAccessDeniedSound();
      const rec: CheckInRecord = {
        id: `CHK-${Date.now()}`,
        memberId: 'UNKNOWN',
        memberName: 'Socio no registrado',
        documentId: trimmed,
        planType: 'mensualidad',
        timestamp: nowIso,
        status: 'denegado',
        reason: `Documento ${trimmed} no encontrado en la base de datos de socios.`,
      };
      setCheckIns(prev => [rec, ...prev]);
      showToast('error', 'Acceso Denegado', `No se encontró ningún socio con el documento ${trimmed}`);
      return {
        success: false,
        record: rec,
        message: `El documento ${trimmed} no está registrado en el sistema.`,
      };
    }

    const daysRemaining = getDaysRemaining(member.endDate);

    // Case 1: Pase Diario
    if (member.planType === 'diario') {
      if (daysRemaining < 0) {
        playAccessDeniedSound();
        const rec: CheckInRecord = {
          id: `CHK-${Date.now()}`,
          memberId: member.id,
          memberName: member.name,
          documentId: member.documentId,
          planType: 'diario',
          timestamp: nowIso,
          status: 'denegado',
          reason: 'Pase diario caducado (válido únicamente en la fecha de compra).',
          remainingDays: daysRemaining,
        };
        setCheckIns(prev => [rec, ...prev]);
        showToast('error', 'Pase Diario Expirado', `${member.name} tiene un pase diario que ya caducó.`);
        return { success: false, member, record: rec, message: 'Pase diario expirado. Debe adquirir un nuevo pase.' };
      }

      playAccessGrantedSound();
      const rec: CheckInRecord = {
        id: `CHK-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        documentId: member.documentId,
        planType: 'diario',
        timestamp: nowIso,
        status: 'permitido',
        reason: 'Pase diario válido por hoy.',
        remainingDays: 0,
      };
      setCheckIns(prev => [rec, ...prev]);
      setMembers(prev => prev.map(m => (m.id === member.id ? { ...m, lastCheckIn: nowIso } : m)));
      showToast('success', 'Acceso Permitido', `¡Bienvenido ${member.name}! Pase diario verificado.`);
      return { success: true, member, record: rec, message: '¡Acceso concedido! Pase diario activo hoy.' };
    }

    // Case 2: Tiquetera
    if (member.planType === 'tiquetera') {
      const credits = member.remainingCredits ?? 0;
      if (credits <= 0) {
        playAccessDeniedSound();
        const rec: CheckInRecord = {
          id: `CHK-${Date.now()}`,
          memberId: member.id,
          memberName: member.name,
          documentId: member.documentId,
          planType: 'tiquetera',
          timestamp: nowIso,
          status: 'denegado',
          reason: 'Sin saldo de tiquetes disponibles (0 créditos restantes).',
          remainingCredits: 0,
        };
        setCheckIns(prev => [rec, ...prev]);
        showToast('error', 'Tiquetera Agotada', `${member.name} no tiene créditos restantes.`);
        return {
          success: false,
          member,
          record: rec,
          message: 'Sin créditos restantes. Debe recargar o renovar su tiquetera.',
        };
      }

      if (daysRemaining < 0) {
        playAccessDeniedSound();
        const rec: CheckInRecord = {
          id: `CHK-${Date.now()}`,
          memberId: member.id,
          memberName: member.name,
          documentId: member.documentId,
          planType: 'tiquetera',
          timestamp: nowIso,
          status: 'denegado',
          reason: `Tiquetera vencida por fecha límite (${member.endDate}).`,
          remainingCredits: credits,
          remainingDays: daysRemaining,
        };
        setCheckIns(prev => [rec, ...prev]);
        showToast('error', 'Tiquetera Vencida', `La vigencia de la tiquetera expiró.`);
        return {
          success: false,
          member,
          record: rec,
          message: 'La vigencia temporal de la tiquetera ha expirado.',
        };
      }

      // Check-in granted! Discount 1 credit
      const newCredits = credits - 1;
      const calculated = calculateMemberStatus({
        planType: 'tiquetera',
        endDate: member.endDate,
        remainingCredits: newCredits,
      });

      playAccessGrantedSound();
      const rec: CheckInRecord = {
        id: `CHK-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        documentId: member.documentId,
        planType: 'tiquetera',
        timestamp: nowIso,
        status: 'permitido',
        reason: `Acceso concedido. Se descontó 1 crédito (${newCredits} restante${newCredits === 1 ? '' : 's'}).`,
        remainingCredits: newCredits,
      };
      setCheckIns(prev => [rec, ...prev]);
      setMembers(prev =>
        prev.map(m =>
          m.id === member.id
            ? { ...m, remainingCredits: newCredits, status: calculated.status, lastCheckIn: nowIso }
            : m
        )
      );
      showToast(
        newCredits <= 2 ? 'warning' : 'success',
        'Acceso Permitido',
        `¡Bienvenido ${member.name}! Te quedan ${newCredits} entradas.`
      );
      return {
        success: true,
        member: { ...member, remainingCredits: newCredits, status: calculated.status },
        record: rec,
        message: `¡Acceso concedido! Saldo restante: ${newCredits} entrada(s).`,
      };
    }

    // Case 3: Mensualidad
    if (daysRemaining < 0) {
      playAccessDeniedSound();
      const rec: CheckInRecord = {
        id: `CHK-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        documentId: member.documentId,
        planType: 'mensualidad',
        timestamp: nowIso,
        status: 'denegado',
        reason: `Membresía mensual vencida hace ${Math.abs(daysRemaining)} días (Fecha de corte: ${member.endDate}).`,
        remainingDays: daysRemaining,
      };
      setCheckIns(prev => [rec, ...prev]);
      showToast('error', 'Membresía Vencida', `${member.name} tiene la membresía vencida.`);
      return {
        success: false,
        member,
        record: rec,
        message: `Membresía vencida hace ${Math.abs(daysRemaining)} día(s). Se requiere renovación.`,
      };
    }

    // Valid Mensualidad
    playAccessGrantedSound();
    const isCloseToExpiration = daysRemaining <= 3;
    const rec: CheckInRecord = {
      id: `CHK-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      documentId: member.documentId,
      planType: 'mensualidad',
      timestamp: nowIso,
      status: 'permitido',
      reason: isCloseToExpiration
        ? `Acceso autorizado - ¡Atención! Tu membresía vence en ${daysRemaining} día(s).`
        : `Acceso autorizado - ${daysRemaining} días restantes.`,
      remainingDays: daysRemaining,
    };

    setCheckIns(prev => [rec, ...prev]);
    setMembers(prev => prev.map(m => (m.id === member.id ? { ...m, lastCheckIn: nowIso } : m)));

    if (isCloseToExpiration) {
      showToast(
        'warning',
        'Membresía por vencer',
        `¡Bienvenido ${member.name}! Tu suscripción vence en ${daysRemaining} días.`
      );
    } else {
      showToast('success', 'Acceso Permitido', `¡Bienvenido ${member.name}! Disfruta tu entrenamiento.`);
    }

    return {
      success: true,
      member,
      record: rec,
      message: isCloseToExpiration
        ? `¡Acceso concedido! Alerta: Tu plan vence en ${daysRemaining} día(s).`
        : `¡Acceso concedido! Días de membresía restantes: ${daysRemaining}.`,
    };
  };

  /**
   * Add a new member
   */
  const addMember = (
    data: Omit<Member, 'id' | 'createdAt' | 'status'>,
    initialPayment?: { amount: number; paymentMethod: PaymentMethod }
  ): Member => {
    const id = `MEM-${(members.length + 1).toString().padStart(3, '0')}`;
    const calculated = calculateMemberStatus(data);
    const newMember: Member = {
      ...data,
      id,
      status: calculated.status,
      createdAt: new Date().toISOString().split('T')[0],
      avatar:
        data.avatar ||
        `https://images.unsplash.com/photo-${data.gender === 'F' ? '1494790108377-be9c29b29330' : '1534528741775-53994a69daeb'}?auto=format&fit=crop&q=80&w=200`,
    };

    setMembers(prev => [newMember, ...prev]);

    // If payment recorded, register transaction
    if (initialPayment && initialPayment.amount > 0) {
      const trxCategory =
        data.planType === 'mensualidad'
          ? 'Membresía'
          : data.planType === 'tiquetera'
          ? 'Tiquetera'
          : 'Pase Diario';

      const trx: Transaction = {
        id: `TRX-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'ingreso',
        category: trxCategory,
        amount: initialPayment.amount,
        paymentMethod: initialPayment.paymentMethod,
        description: `Pago inicial ${trxCategory} - ${newMember.name}`,
        memberId: newMember.id,
        memberName: newMember.name,
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      };
      setTransactions(prev => [trx, ...prev]);
      playCashSound();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }

    showToast('success', 'Socio Registrado', `${newMember.name} fue agregado exitosamente.`);
    recordLocalChange();
    return newMember;
  };

  /**
   * Update member
   */
  const updateMember = (id: string, data: Partial<Member>) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id === id) {
          const updated = { ...m, ...data };
          const calculated = calculateMemberStatus(updated);
          return { ...updated, status: calculated.status };
        }
        return m;
      })
    );
    recordLocalChange();
    showToast('info', 'Socio Actualizado', 'Los datos del cliente han sido modificados.');
  };

  /**
   * Delete member
   */
  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    recordLocalChange();
    showToast('warning', 'Socio Eliminado', 'El registro del socio fue removido.');
  };

  /**
   * Renew membership with immediate payment transaction
   */
  const renewMembership = (params: {
    memberId: string;
    planType: PlanType;
    durationDays?: number;
    creditsToAdd?: number;
    amount: number;
    paymentMethod: PaymentMethod;
  }) => {
    const member = members.find(m => m.id === params.memberId);
    if (!member) return;

    let newEndDate = member.endDate;
    let newCredits = member.remainingCredits || 0;
    const now = new Date();

    if (params.planType === 'mensualidad') {
      const days = params.durationDays || 30;
      // If current end date is in the future, add from end date, else from today
      const currentEnd = new Date(member.endDate);
      const baseDate = currentEnd > now ? currentEnd : now;
      baseDate.setDate(baseDate.getDate() + days);
      newEndDate = baseDate.toISOString().split('T')[0];
    } else if (params.planType === 'tiquetera') {
      const added = params.creditsToAdd || 12;
      newCredits = (member.remainingCredits && member.remainingCredits > 0 ? member.remainingCredits : 0) + added;
      // Set validity for 60 days
      const validity = new Date();
      validity.setDate(validity.getDate() + 60);
      newEndDate = validity.toISOString().split('T')[0];
    } else {
      // Diario
      newEndDate = now.toISOString().split('T')[0];
    }

    const calculated = calculateMemberStatus({
      planType: params.planType,
      endDate: newEndDate,
      remainingCredits: newCredits,
    });

    setMembers(prev =>
      prev.map(m =>
        m.id === member.id
          ? {
              ...m,
              planType: params.planType,
              startDate: now.toISOString().split('T')[0],
              endDate: newEndDate,
              remainingCredits: params.planType === 'tiquetera' ? newCredits : undefined,
              totalCredits: params.planType === 'tiquetera' ? (m.totalCredits || 0) + (params.creditsToAdd || 12) : undefined,
              status: calculated.status,
            }
          : m
      )
    );

    // Record Transaction
    const category =
      params.planType === 'mensualidad'
        ? 'Membresía'
        : params.planType === 'tiquetera'
        ? 'Tiquetera'
        : 'Pase Diario';

    const trx: Transaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'ingreso',
      category,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      description: `Renovación de ${category} - ${member.name}`,
      memberId: member.id,
      memberName: member.name,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    };

    setTransactions(prev => [trx, ...prev]);
    recordLocalChange();
    playCashSound();
    confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    showToast('success', '¡Renovación Exitosa!', `La suscripción de ${member.name} ha sido renovada hasta el ${newEndDate}.`);
  };

  /**
   * Fast Drop-in / Pase Diario registration (15 seconds)
   */
  const registerDailyPass = (params: {
    name: string;
    documentId: string;
    phone: string;
    amount: number;
    paymentMethod: PaymentMethod;
  }): Member => {
    const today = new Date().toISOString().split('T')[0];
    const newMember = addMember(
      {
        name: params.name,
        documentId: params.documentId,
        phone: params.phone,
        email: `${params.documentId}@gimnasio.com`,
        gender: 'Otro',
        planType: 'diario',
        startDate: today,
        endDate: today,
        notes: 'Registro rápido pase diario (Drop-in).',
      },
      {
        amount: params.amount,
        paymentMethod: params.paymentMethod,
      }
    );

    // Auto check-in immediately for today
    const nowIso = new Date().toISOString();
    const checkinRec: CheckInRecord = {
      id: `CHK-${Date.now()}`,
      memberId: newMember.id,
      memberName: newMember.name,
      documentId: newMember.documentId,
      planType: 'diario',
      timestamp: nowIso,
      status: 'permitido',
      reason: 'Pase diario verificado y acceso concedido de inmediato.',
      remainingDays: 0,
    };
    setCheckIns(prev => [checkinRec, ...prev]);
    playAccessGrantedSound();

    return newMember;
  };

  /**
   * Mini-POS Sell Products
   */
  const sellProducts = (items: CartItem[], paymentMethod: PaymentMethod, customerName?: string) => {
    if (!items.length) return;

    // Deduct stock
    setProducts(prev =>
      prev.map(p => {
        const cartItem = items.find(ci => ci.product.id === p.id);
        if (cartItem) {
          const newStock = Math.max(0, p.stock - cartItem.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const summary = items.map(i => `${i.quantity}x ${i.product.name}`).join(', ');

    const trx: Transaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'ingreso',
      category: 'Tienda',
      amount: totalAmount,
      paymentMethod,
      description: `Venta POS: ${summary}${customerName ? ` (${customerName})` : ''}`,
      receiptNumber: `POS-${Date.now().toString().slice(-6)}`,
    };

    setTransactions(prev => [trx, ...prev]);
    recordLocalChange();
    playCashSound();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast('success', 'Venta Registrada', `Total cobrado: $${totalAmount.toLocaleString('es-CO')}`);
  };

  /**
   * Add custom transaction
   */
  const addTransaction = (data: Omit<Transaction, 'id' | 'receiptNumber'>) => {
    const trx: Transaction = {
      ...data,
      id: `TRX-${Date.now()}`,
      receiptNumber: `${data.type === 'ingreso' ? 'REC' : 'GAS'}-${Date.now().toString().slice(-6)}`,
    };
    setTransactions(prev => [trx, ...prev]);
    recordLocalChange();
    showToast(
      data.type === 'ingreso' ? 'success' : 'info',
      data.type === 'ingreso' ? 'Ingreso Registrado' : 'Gasto Registrado',
      `Monto: $${data.amount.toLocaleString('es-CO')} (${data.category})`
    );
  };

  /**
   * Add Anthropometry Record
   */
  const addAnthropometry = (data: Omit<AnthropometryRecord, 'id' | 'bmi' | 'bmiCategory'>) => {
    const { bmi, category } = calculateBMI(data.weightKg, data.heightCm);
    const newRecord: AnthropometryRecord = {
      ...data,
      id: `ANT-${Date.now()}`,
      bmi,
      bmiCategory: category,
    };
    setAnthropometry(prev => [newRecord, ...prev]);
    showToast('success', 'Ficha Antropométrica Guardada', `Nuevo registro físico para el socio.`);
  };

  /**
   * Save Workout Routine
   */
  const saveRoutine = (routine: WorkoutRoutine) => {
    setRoutines(prev => {
      const exists = prev.some(r => r.id === routine.id);
      if (exists) {
        return prev.map(r => (r.id === routine.id ? routine : r));
      }
      return [routine, ...prev];
    });
    showToast('success', 'Rutina Guardada', `Plan de entrenamiento asignado exitosamente.`);
  };

  /**
   * Toggle Enroll in Group Class
   */
  const toggleEnrollClass = (classId: string, memberId: string): boolean => {
    let enrolledNow = false;
    setClasses(prev =>
      prev.map(cls => {
        if (cls.id === classId) {
          const isEnrolled = cls.enrolledMemberIds.includes(memberId);
          if (isEnrolled) {
            // Unenroll
            enrolledNow = false;
            return {
              ...cls,
              enrolledMemberIds: cls.enrolledMemberIds.filter(id => id !== memberId),
            };
          } else {
            // Check capacity
            if (cls.enrolledMemberIds.length >= cls.capacity) {
              showToast('error', 'Cupo Lleno', 'Esta clase ha alcanzado su capacidad máxima permitida.');
              return cls;
            }
            enrolledNow = true;
            return {
              ...cls,
              enrolledMemberIds: [...cls.enrolledMemberIds, memberId],
            };
          }
        }
        return cls;
      })
    );
    if (enrolledNow) {
      showToast('success', 'Cupo Reservado', 'El socio ha sido inscrito a la clase grupal.');
    } else {
      showToast('info', 'Inscripción Cancelada', 'Se ha liberado el cupo en la clase.');
    }
    return enrolledNow;
  };

  /**
   * Update gym machine equipment
   */
  const updateEquipment = (id: string, data: Partial<GymEquipment>) => {
    setEquipment(prev =>
      prev.map(eq => (eq.id === id ? { ...eq, ...data } : eq))
    );
    showToast('info', 'Equipo Actualizado', 'El estado del equipo ha sido actualizado.');
  };

  /**
   * Reset seed data to fresh default
   */
  const resetToSeedData = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}members`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}checkins`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}products`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}transactions`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}anthropometry`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}routines`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}classes`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}equipment`);

    setMembers(SEED_MEMBERS);
    setCheckIns(SEED_CHECKINS);
    setProducts(SEED_PRODUCTS);
    setTransactions(SEED_TRANSACTIONS);
    setAnthropometry(SEED_ANTHROPOMETRY);
    setRoutines(SEED_ROUTINES);
    setClasses(SEED_CLASSES);
    setEquipment(SEED_EQUIPMENT);

    setPendingChangesCount(0);
    setCloudSyncStatus('synced');
    showToast('success', 'Datos Restaurados', 'Se han restablecido todos los datos de demostración con éxito.');
  };

  /**
   * Export all data to Excel (.xlsx) workbook
   */
  const exportToExcel = () => {
    const payload: FullGymBackupData = {
      members,
      transactions,
      checkIns,
      products,
      equipment,
      anthropometry,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    exportGymToExcel(payload);
    showToast('success', 'Excel Generado con Éxito', 'Se descargó el libro completo de Excel con todos los socios, caja e inventario.');
  };

  /**
   * Export full JSON backup
   */
  const exportToJson = () => {
    const payload: FullGymBackupData = {
      members,
      transactions,
      checkIns,
      products,
      equipment,
      anthropometry,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    exportGymToJson(payload);
    showToast('success', 'Copia de Seguridad JSON', 'Archivo de respaldo local descargado.');
  };

  /**
   * Restore full backup from file
   */
  const restoreFromBackup = (backup: FullGymBackupData) => {
    if (backup.members && Array.isArray(backup.members)) setMembers(backup.members);
    if (backup.transactions && Array.isArray(backup.transactions)) setTransactions(backup.transactions);
    if (backup.checkIns && Array.isArray(backup.checkIns)) setCheckIns(backup.checkIns);
    if (backup.products && Array.isArray(backup.products)) setProducts(backup.products);
    if (backup.equipment && Array.isArray(backup.equipment)) setEquipment(backup.equipment);
    if (backup.anthropometry && Array.isArray(backup.anthropometry)) setAnthropometry(backup.anthropometry);

    setPendingChangesCount(0);
    setCloudSyncStatus('synced');
    showToast('success', 'Base de Datos Restaurada', 'Todos los datos se han cargado exitosamente desde el respaldo.');
  };

  /**
   * Sync current local database to cloud storage
   */
  const syncToCloud = async (): Promise<boolean> => {
    setIsSyncingCloud(true);
    setCloudSyncStatus('syncing');

    const payload: FullGymBackupData = {
      members,
      transactions,
      checkIns,
      products,
      equipment,
      anthropometry,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };

    try {
      const result = await executeCloudSync(payload, cloudConfig);
      if (result.success) {
        setIsSyncingCloud(false);
        setCloudSyncStatus('synced');
        setLastSyncedAt(result.snapshot.timestamp);
        setPendingChangesCount(0);
        setCloudSnapshots(getCloudSnapshots());
        showToast('success', 'Sincronizado con la Nube', 'Copia de seguridad guardada en la bóveda cloud.');
        return true;
      }
      throw new Error('Sync error');
    } catch {
      setIsSyncingCloud(false);
      setCloudSyncStatus('error');
      showToast('error', 'Error en Nube', 'No se pudo sincronizar con el servidor en la nube.');
      return false;
    }
  };

  const updateCloudConfig = (config: CloudConfig) => {
    setCloudConfigState(config);
    saveCloudConfig(config);
    showToast('info', 'Configuración Actualizada', 'Preferencias de sincronización cloud guardadas.');
  };

  // Auto-sync effect: if enabled and pending changes > 0, debounce sync
  useEffect(() => {
    if (!cloudConfig.autoSync || pendingChangesCount === 0 || isSyncingCloud) return;

    const timer = setTimeout(() => {
      syncToCloud();
    }, 4500);

    return () => clearTimeout(timer);
  }, [pendingChangesCount, cloudConfig.autoSync]);

  return (
    <GymContext.Provider
      value={{
        members,
        checkIns,
        products,
        transactions,
        anthropometry,
        routines,
        classes,
        equipment,
        currentRole,
        soundEnabled,
        toasts,
        setCurrentRole,
        setSoundEnabled,
        showToast,
        removeToast,
        processCheckIn,
        addMember,
        updateMember,
        deleteMember,
        renewMembership,
        registerDailyPass,
        sellProducts,
        addTransaction,
        addAnthropometry,
        saveRoutine,
        toggleEnrollClass,
        updateEquipment,
        resetToSeedData,
        isSyncingCloud,
        cloudSyncStatus,
        lastSyncedAt,
        pendingChangesCount,
        cloudSnapshots,
        cloudConfig,
        exportToExcel,
        exportToJson,
        restoreFromBackup,
        syncToCloud,
        updateCloudConfig,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
