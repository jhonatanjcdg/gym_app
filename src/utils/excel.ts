import * as XLSX from 'xlsx';
import {
  Member,
  Transaction,
  CheckInRecord,
  Product,
  GymEquipment,
  AnthropometryRecord,
} from '../types';

export interface FullGymBackupData {
  members: Member[];
  transactions: Transaction[];
  checkIns: CheckInRecord[];
  products: Product[];
  equipment: GymEquipment[];
  anthropometry?: AnthropometryRecord[];
  exportDate: string;
  version: string;
}

/**
 * Generates and downloads a real multi-sheet Excel (.xlsx) file with all gym databases
 */
export const exportGymToExcel = (data: FullGymBackupData) => {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Socios & Membresías
  const membersRows = data.members.map(m => ({
    'ID Socio': m.id,
    'Cédula / Documento': m.documentId,
    'Nombre Completo': m.name,
    'Teléfono': m.phone,
    'Correo': m.email,
    'Género': m.gender,
    'Tipo de Plan': m.planType.toUpperCase(),
    'Estado': m.status.toUpperCase(),
    'Fecha Inicio': m.startDate,
    'Fecha Vencimiento': m.endDate,
    'Créditos Totales': m.totalCredits ?? 'N/A',
    'Créditos Restantes': m.remainingCredits ?? 'N/A',
    'Contacto Emergencia': m.emergencyContact ? `${m.emergencyContact.name} (${m.emergencyContact.phone})` : '',
    'Notas': m.notes || '',
    'Fecha Registro': m.createdAt,
  }));
  const wsMembers = XLSX.utils.json_to_sheet(membersRows);
  XLSX.utils.book_append_sheet(wb, wsMembers, 'Socios_Membresias');

  // 2. Sheet: Caja & Transacciones
  const transactionsRows = data.transactions.map(t => ({
    'ID Transacción': t.id,
    'N° Comprobante': t.receiptNumber,
    'Fecha & Hora': t.date,
    'Tipo': t.type.toUpperCase(),
    'Categoría': t.category,
    'Monto (COP)': t.amount,
    'Método de Pago': t.paymentMethod,
    'Descripción': t.description,
    'Socio Asociado': t.memberName || '',
  }));
  const wsTransactions = XLSX.utils.json_to_sheet(transactionsRows);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Caja_Finanzas');

  // 3. Sheet: Control de Asistencias (Check-ins)
  const checkinsRows = data.checkIns.map(c => ({
    'ID Registro': c.id,
    'Fecha & Hora': c.timestamp,
    'Cédula': c.documentId,
    'Nombre Socio': c.memberName,
    'Plan': c.planType.toUpperCase(),
    'Estado Acceso': c.status.toUpperCase(),
    'Motivo / Detalle': c.reason || '',
    'Días Restantes': c.remainingDays ?? '',
    'Créditos Restantes': c.remainingCredits ?? '',
  }));
  const wsCheckins = XLSX.utils.json_to_sheet(checkinsRows);
  XLSX.utils.book_append_sheet(wb, wsCheckins, 'Control_Asistencias');

  // 4. Sheet: Inventario Mini-POS
  const productsRows = data.products.map(p => ({
    'ID Producto': p.id,
    'Código SKU': p.sku,
    'Nombre Producto': p.name,
    'Categoría': p.category,
    'Precio Venta': p.price,
    'Costo Compra': p.cost,
    'Stock Actual': p.stock,
    'Stock Mínimo Alerta': p.minStock,
  }));
  const wsProducts = XLSX.utils.json_to_sheet(productsRows);
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Inventario_Tienda');

  // 5. Sheet: Equipos & Mantenimiento
  const equipmentRows = data.equipment.map(e => ({
    'ID Equipo': e.id,
    'N° Serial': e.serialNumber,
    'Nombre Máquina': e.name,
    'Categoría': e.category,
    'Estado Operativo': e.status.toUpperCase(),
    'Último Mantenimiento': e.lastMaintenanceDate,
    'Próxima Revisión': e.nextMaintenanceDate,
    'Observaciones': e.notes || '',
  }));
  const wsEquipment = XLSX.utils.json_to_sheet(equipmentRows);
  XLSX.utils.book_append_sheet(wb, wsEquipment, 'Equipos_Mantenimiento');

  // File download
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `TITAN_GYM_COPIA_LOCAL_EXCEL_${dateStr}.xlsx`);
};

/**
 * Downloads full JSON backup file for 100% fidelity restore
 */
export const exportGymToJson = (data: FullGymBackupData) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.href = url;
  link.download = `TITAN_GYM_BACKUP_COMPLETO_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parses uploaded JSON backup file
 */
export const parseJsonBackup = (file: File): Promise<FullGymBackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.members || !parsed.transactions) {
          throw new Error('El archivo no contiene un formato de respaldo válido de Titan Gym.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de respaldo.'));
    reader.readAsText(file);
  });
};
