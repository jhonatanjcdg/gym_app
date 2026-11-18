import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Wallet, Calendar, Ticket, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useGym } from '../../context/GymContext';
import { Member, PaymentMethod, PlanType } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const RenewModal: React.FC<RenewModalProps> = ({ isOpen, onClose, member }) => {
  const { renewMembership } = useGym();

  const [planType, setPlanType] = useState<PlanType>('mensualidad');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(12);
  const [amount, setAmount] = useState<number>(110000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia / Nequi / Daviplata');

  useEffect(() => {
    if (member) {
      setPlanType(member.planType);
      if (member.planType === 'mensualidad') {
        setDurationDays(30);
        setAmount(110000);
      } else if (member.planType === 'tiquetera') {
        setCreditsToAdd(12);
        setAmount(120000);
      } else {
        setAmount(20000);
      }
    }
  }, [member]);

  if (!member) return null;

  const handlePlanTypeChange = (type: PlanType) => {
    setPlanType(type);
    if (type === 'mensualidad') {
      setDurationDays(30);
      setAmount(110000);
    } else if (type === 'tiquetera') {
      setCreditsToAdd(12);
      setAmount(120000);
    } else {
      setDurationDays(1);
      setAmount(20000);
    }
  };

  const handleDurationPreset = (days: number, cost: number) => {
    setDurationDays(days);
    setAmount(cost);
  };

  const handleCreditsPreset = (credits: number, cost: number) => {
    setCreditsToAdd(credits);
    setAmount(cost);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renewMembership({
      memberId: member.id,
      planType,
      durationDays: planType === 'mensualidad' ? durationDays : undefined,
      creditsToAdd: planType === 'tiquetera' ? creditsToAdd : undefined,
      amount,
      paymentMethod,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ Renovar Plan / Membresía"
      subtitle={`Socio: ${member.name} (${member.documentId})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current status reminder */}
        <div className="p-3 bg-dark-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block">Plan Actual:</span>
            <span className="font-bold text-white capitalize">{member.planType}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Último Vencimiento:</span>
            <span className="font-semibold text-slate-300">{formatDate(member.endDate)}</span>
          </div>
        </div>

        {/* Plan Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Seleccionar Modelo</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mensualidad', label: 'Mensualidad', icon: <Calendar className="w-4 h-4" /> },
              { id: 'tiquetera', label: 'Tiquetera', icon: <Ticket className="w-4 h-4" /> },
              { id: 'diario', label: 'Pase Diario', icon: <CheckCircle2 className="w-4 h-4" /> },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePlanTypeChange(p.id as PlanType)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  planType === p.id
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                    : 'border-slate-800 bg-dark-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                {p.icon}
                <span className="mt-1">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Presets depending on plan */}
        {planType === 'mensualidad' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duración del Paquete</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { days: 30, label: '1 Mes', cost: 110000 },
                { days: 90, label: '3 Meses (Trimestral)', cost: 300000 },
                { days: 365, label: '1 Año (Anual)', cost: 1050000 },
              ].map(preset => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => handleDurationPreset(preset.days, preset.cost)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    durationDays === preset.days
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-slate-800 bg-dark-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{preset.label}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">{formatCurrency(preset.cost)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {planType === 'tiquetera' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Entradas a Recargar</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { credits: 8, label: '8 Entradas', cost: 85000 },
                { credits: 12, label: '12 Entradas', cost: 120000 },
                { credits: 20, label: '20 Entradas', cost: 180000 },
              ].map(preset => (
                <button
                  key={preset.credits}
                  type="button"
                  onClick={() => handleCreditsPreset(preset.credits, preset.cost)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    creditsToAdd === preset.credits
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-slate-800 bg-dark-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{preset.label}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">{formatCurrency(preset.cost)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Monto a Cobrar (COP)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Método de Pago</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Efectivo', label: 'Efectivo', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'Transferencia / Nequi / Daviplata', label: 'Nequi / Transf', icon: <Wallet className="w-4 h-4" /> },
              { id: 'Tarjeta', label: 'Tarjeta', icon: <CreditCard className="w-4 h-4" /> },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                  paymentMethod === m.id
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-800 bg-dark-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                {m.icon}
                <span className="mt-1 truncate max-w-full">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 hover:brightness-110 shadow-neon-green flex items-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirmar Renovación y Cobro
          </button>
        </div>
      </form>
    </Modal>
  );
};
