import React, { useState } from 'react';
import { Zap, DollarSign, CreditCard, Wallet } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useGym } from '../../context/GymContext';
import { PaymentMethod } from '../../types';

interface DailyPassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyPassModal: React.FC<DailyPassModalProps> = ({ isOpen, onClose }) => {
  const { registerDailyPass } = useGym();
  const [name, setName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number>(20000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !documentId.trim()) return;

    registerDailyPass({
      name: name.trim(),
      documentId: documentId.trim(),
      phone: phone.trim() || '+57 300 000 0000',
      amount,
      paymentMethod,
    });

    // Reset and close
    setName('');
    setDocumentId('');
    setPhone('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ Pase Diario Rápido (Drop-in)"
      subtitle="Registro express de 15 segundos con check-in inmediato"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-emerald-400">Válido por el día de hoy.</span> Se creará el registro, se sumará el cobro a la caja diaria y se autorizará el acceso de forma automática.
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
          <input
            type="text"
            required
            placeholder="Ej. Mateo Gómez"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Documento / Cédula / DNI *</label>
            <input
              type="text"
              required
              placeholder="Ej. 1045892301"
              value={documentId}
              onChange={e => setDocumentId(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Celular (Opcional)</label>
            <input
              type="tel"
              placeholder="+57 312 000 0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tarifa del Pase Diario (COP)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Método de Pago</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Efectivo', label: 'Efectivo', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'Transferencia / Nequi / Daviplata', label: 'Nequi/Transf', icon: <Wallet className="w-4 h-4" /> },
              { id: 'Tarjeta', label: 'Tarjeta', icon: <CreditCard className="w-4 h-4" /> },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  paymentMethod === m.id
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-800 bg-dark-950/70 text-slate-400 hover:border-slate-700'
                }`}
              >
                {m.icon}
                <span className="mt-1 truncate max-w-full">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 hover:brightness-110 shadow-neon-green flex items-center gap-2 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Cobrar y Dar Acceso Inmediato
          </button>
        </div>
      </form>
    </Modal>
  );
};
