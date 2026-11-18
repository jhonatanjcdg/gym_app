import React, { useState } from 'react';
import { UserPlus, Calendar, Ticket, Zap, DollarSign, Wallet, CreditCard } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useGym } from '../../context/GymContext';
import { PlanType, PaymentMethod } from '../../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { addMember } = useGym();

  const [name, setName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'Otro'>('M');
  const [planType, setPlanType] = useState<PlanType>('mensualidad');

  // Plan specifics
  const [durationDays, setDurationDays] = useState<number>(30);
  const [credits, setCredits] = useState<number>(12);
  const [amount, setAmount] = useState<number>(110000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia / Nequi / Daviplata');

  // Emergency contact & notes
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handlePlanTypeChange = (type: PlanType) => {
    setPlanType(type);
    if (type === 'mensualidad') {
      setDurationDays(30);
      setAmount(110000);
    } else if (type === 'tiquetera') {
      setCredits(12);
      setAmount(120000);
    } else {
      setDurationDays(1);
      setAmount(20000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !documentId.trim()) return;

    const startDate = new Date().toISOString().split('T')[0];
    const end = new Date();

    if (planType === 'mensualidad') {
      end.setDate(end.getDate() + durationDays);
    } else if (planType === 'tiquetera') {
      end.setDate(end.getDate() + 60); // 60 days validity
    } else {
      // Diario
    }

    const endDate = end.toISOString().split('T')[0];

    addMember(
      {
        name: name.trim(),
        documentId: documentId.trim(),
        phone: phone.trim() || '+57 300 000 0000',
        email: email.trim() || `${documentId.trim()}@cliente.com`,
        gender,
        planType,
        startDate,
        endDate,
        totalCredits: planType === 'tiquetera' ? credits : undefined,
        remainingCredits: planType === 'tiquetera' ? credits : undefined,
        emergencyContact: emergencyName.trim()
          ? { name: emergencyName.trim(), phone: emergencyPhone.trim() }
          : undefined,
        notes: notes.trim() || undefined,
      },
      {
        amount,
        paymentMethod,
      }
    );

    // Reset and close
    setName('');
    setDocumentId('');
    setPhone('');
    setEmail('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Registro de Socio"
      subtitle="Alta de cliente con suscripción por tiempo, tiquetera o pase diario"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              placeholder="Ej. Roberto Gómez"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Documento / Cédula / DNI *</label>
            <input
              type="text"
              required
              placeholder="Ej. 1029384756"
              value={documentId}
              onChange={e => setDocumentId(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono / WhatsApp *</label>
            <input
              type="tel"
              required
              placeholder="+57 310 123 4567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="cliente@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Gender & Emergency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Género</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value as 'M' | 'F' | 'Otro')}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro / Prefiero no decir</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contacto de Emergencia</label>
            <input
              type="text"
              placeholder="Nombre del familiar"
              value={emergencyName}
              onChange={e => setEmergencyName(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Emergencia</label>
            <input
              type="tel"
              placeholder="+57 300 000 0000"
              value={emergencyPhone}
              onChange={e => setEmergencyPhone(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Plan Model Selection */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            Modelo de Membresía
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mensualidad', label: 'Mensualidad (Tiempo)', desc: '30, 90 o 365 días', icon: <Calendar className="w-4 h-4" /> },
              { id: 'tiquetera', label: 'Tiquetera (Créditos)', desc: '8, 12 o 20 entradas', icon: <Ticket className="w-4 h-4" /> },
              { id: 'diario', label: 'Pase Diario', desc: '1 día (Drop-in)', icon: <Zap className="w-4 h-4" /> },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => handlePlanTypeChange(m.id as PlanType)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  planType === m.id
                    ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-sm'
                    : 'border-slate-800 bg-dark-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  {m.icon}
                  <span>{m.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Plan Configuration */}
        {planType === 'mensualidad' && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { days: 30, label: '1 Mes (30 días)', cost: 110000 },
              { days: 90, label: '3 Meses (Trimestral)', cost: 300000 },
              { days: 365, label: '1 Año (Anual)', cost: 1050000 },
            ].map(p => (
              <button
                key={p.days}
                type="button"
                onClick={() => {
                  setDurationDays(p.days);
                  setAmount(p.cost);
                }}
                className={`p-2 rounded-xl border text-xs text-left ${
                  durationDays === p.days ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold' : 'border-slate-800 bg-dark-950 text-slate-400'
                }`}
              >
                <div>{p.label}</div>
                <div className="text-[11px] text-emerald-400 font-semibold">${p.cost.toLocaleString('es-CO')}</div>
              </button>
            ))}
          </div>
        )}

        {planType === 'tiquetera' && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { credits: 8, label: '8 Entradas', cost: 85000 },
              { credits: 12, label: '12 Entradas', cost: 120000 },
              { credits: 20, label: '20 Entradas', cost: 180000 },
            ].map(p => (
              <button
                key={p.credits}
                type="button"
                onClick={() => {
                  setCredits(p.credits);
                  setAmount(p.cost);
                }}
                className={`p-2 rounded-xl border text-xs text-left ${
                  credits === p.credits ? 'border-cyan-500 bg-cyan-500/10 text-white font-bold' : 'border-slate-800 bg-dark-950 text-slate-400'
                }`}
              >
                <div>{p.label}</div>
                <div className="text-[11px] text-cyan-400 font-semibold">${p.cost.toLocaleString('es-CO')}</div>
              </button>
            ))}
          </div>
        )}

        {/* Payment & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Monto Cobrado (COP)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia / Nequi / Daviplata">Transferencia / Nequi / Daviplata</option>
              <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Notas Médicas o Deportivas</label>
          <textarea
            rows={2}
            placeholder="Lesiones previas, objetivos, horario de entrenamiento..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-dark-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Buttons */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 hover:brightness-110 shadow-neon-green flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Completar Registro y Cobro
          </button>
        </div>
      </form>
    </Modal>
  );
};
