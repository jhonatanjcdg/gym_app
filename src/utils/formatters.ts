import { Member, MemberStatus, PlanType } from '../types';

/**
 * Format currency into readable format
 */
export const formatCurrency = (amount: number, currencySymbol: string = '$'): string => {
  return `${currencySymbol} ${amount.toLocaleString('es-CO')}`;
};

/**
 * Format ISO or YYYY-MM-DD date into friendly Spanish date
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

/**
 * Format timestamp with time (e.g., "17 Nov 05:30 PM")
 */
export const formatDateTime = (isoStr: string): string => {
  if (!isoStr) return 'N/A';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return isoStr;
  }
};

/**
 * Calculate difference in days between target date and current date (2026-11-17)
 */
export const getDaysRemaining = (endDateStr: string): number => {
  if (!endDateStr) return 0;
  const target = new Date(endDateStr.includes('T') ? endDateStr : `${endDateStr}T23:59:59`);
  const now = new Date(); // Or today's date
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Compute the dynamic member status:
 * - For Mensualidad: Vencido if daysRemaining < 0; Por vencer if daysRemaining <= 3; Activo otherwise
 * - For Tiquetera: Vencido if remainingCredits <= 0 or (endDate passed); Por vencer if remainingCredits <= 2; Activo otherwise
 * - For Diario: Activo if date is today; Vencido if date is before today
 */
export const calculateMemberStatus = (member: {
  planType: PlanType;
  endDate: string;
  remainingCredits?: number;
}): { status: MemberStatus; daysRemaining: number; label: string } => {
  const daysRemaining = getDaysRemaining(member.endDate);

  if (member.planType === 'diario') {
    if (daysRemaining >= 0) {
      return { status: 'activo', daysRemaining: 0, label: 'Pase Válido Hoy' };
    }
    return { status: 'vencido', daysRemaining, label: 'Pase Expirado' };
  }

  if (member.planType === 'tiquetera') {
    const credits = member.remainingCredits ?? 0;
    if (credits <= 0) {
      return { status: 'vencido', daysRemaining, label: 'Sin Entradas (0)' };
    }
    // Also check date expiration if set
    if (daysRemaining < 0) {
      return { status: 'vencido', daysRemaining, label: 'Tiquetera Vencida' };
    }
    if (credits <= 2) {
      return { status: 'por_vencer', daysRemaining, label: `Por agotar (${credits} entradas)` };
    }
    if (daysRemaining <= 3) {
      return { status: 'por_vencer', daysRemaining, label: `Vence en ${daysRemaining}d` };
    }
    return { status: 'activo', daysRemaining, label: `Activo (${credits} entradas)` };
  }

  // Mensualidad
  if (daysRemaining < 0) {
    return { status: 'vencido', daysRemaining, label: `Venció hace ${Math.abs(daysRemaining)}d` };
  }
  if (daysRemaining <= 3) {
    return { status: 'por_vencer', daysRemaining, label: `Vence en ${daysRemaining}d` };
  }
  return { status: 'activo', daysRemaining, label: `Activo (${daysRemaining}d)` };
};

/**
 * Calculate BMI (IMC) and category
 */
export const calculateBMI = (weightKg: number, heightCm: number): { bmi: number; category: string; color: string } => {
  if (!weightKg || !heightCm) return { bmi: 0, category: 'Desconocido', color: 'text-gray-400' };
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) return { bmi, category: 'Bajo peso', color: 'text-yellow-400' };
  if (bmi < 25.0) return { bmi, category: 'Peso normal', color: 'text-emerald-400' };
  if (bmi < 30.0) return { bmi, category: 'Sobrepeso', color: 'text-amber-400' };
  if (bmi < 35.0) return { bmi, category: 'Obesidad Grado I', color: 'text-orange-400' };
  return { bmi, category: 'Obesidad Grado II+', color: 'text-rose-500' };
};

/**
 * Generate a prefilled WhatsApp link for renewal alerts
 */
export const generateWhatsAppRenewalLink = (member: Member, gymName: string = 'TITAN GYM'): string => {
  const cleanPhone = member.phone.replace(/[^0-9]/g, '');
  const days = getDaysRemaining(member.endDate);
  
  let reasonText = '';
  if (member.planType === 'tiquetera') {
    reasonText = `te quedan ${member.remainingCredits ?? 0} entradas disponibles en tu tiquetera`;
  } else if (days < 0) {
    reasonText = `tu membresía venció hace ${Math.abs(days)} día(s)`;
  } else if (days === 0) {
    reasonText = `tu membresía vence hoy`;
  } else {
    reasonText = `tu membresía está próxima a vencer en ${days} días (${formatDate(member.endDate)})`;
  }

  const message = `¡Hola ${member.name}! 👋 Te saludamos desde *${gymName}*. Te recordamos que ${reasonText}. 🏋️‍♂️💪

Aprovecha nuestras promociones de renovación esta semana para no perder tu progreso. ¿Deseas que te enviemos los medios de pago disponibles?`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Export array of data to CSV file download
 */
export const exportToCSV = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            const cell = row[k] === null || row[k] === undefined ? '' : row[k];
            let cellStr = cell instanceof Date ? cell.toLocaleString() : String(cell);
            cellStr = cellStr.replace(/"/g, '""');
            if (cellStr.search(/("|,|\n)/g) >= 0) cellStr = `"${cellStr}"`;
            return cellStr;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
