import React, { useState, useRef } from 'react';
import {
  Cloud,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
  History,
  HardDrive,
  RefreshCw,
  Shield,
  Layers,
  Settings,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useGym } from '../../context/GymContext';
import { formatDateTime } from '../../utils/formatters';
import { parseJsonBackup } from '../../utils/excel';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
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
    showToast,
  } = useGym();

  const [activeTab, setActiveTab] = useState<'flow' | 'snapshots' | 'settings'>('flow');
  const [provider, setProvider] = useState(cloudConfig.provider);
  const [endpointUrl, setEndpointUrl] = useState(cloudConfig.endpointUrl || '');
  const [apiKey, setApiKey] = useState(cloudConfig.apiKey || '');
  const [autoSync, setAutoSync] = useState(cloudConfig.autoSync);
  const [isRestoring, setIsRestoring] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsRestoring(true);
      const parsedData = await parseJsonBackup(file);
      restoreFromBackup(parsedData);
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setIsRestoring(false);
      showToast('error', 'Error al Restaurar', err?.message || 'Archivo de respaldo no reconocido.');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCloudConfig({
      ...cloudConfig,
      autoSync,
      provider,
      endpointUrl: endpointUrl.trim() || undefined,
      apiKey: apiKey.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Centro de Seguridad: Local (Excel) + Nube"
      subtitle="Estrategia en dos capas: Guardado local inmediato y sincronización segura en la nube"
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Step-by-Step Security Pipeline Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gradient-to-r from-dark-950 via-dark-900 to-dark-850 border border-slate-800">
          {/* Step 1 Card */}
          <div className="p-3.5 rounded-xl bg-dark-900 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Paso 1: Local</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">Activo</span>
              </div>
              <h4 className="text-xs font-black text-white">Almacenamiento Local & Excel</h4>
              <p className="text-[11px] text-slate-400">Guarda en disco sin internet</p>
            </div>
          </div>

          {/* Step 2 Card */}
          <div className="p-3.5 rounded-xl bg-dark-900 border border-cyan-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Paso 2: Nube</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  cloudSyncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {cloudSyncStatus === 'synced' ? 'Sincronizado' : `${pendingChangesCount} pendientes`}
                </span>
              </div>
              <h4 className="text-xs font-black text-white">Bóveda Cloud Cifrada</h4>
              <p className="text-[11px] text-slate-400">Copia de seguridad externa</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'flow', label: 'Copias Locales & Subida a la Nube', icon: <Layers className="w-4 h-4" /> },
            { id: 'snapshots', label: 'Historial de Versiones Cloud', icon: <History className="w-4 h-4" /> },
            { id: 'settings', label: 'Ajustes de Proveedor Nube', icon: <Settings className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Main Flow (Local Excel + Cloud Sync) */}
        {activeTab === 'flow' && (
          <div className="space-y-5">
            {/* Action 1: Excel & Local Files */}
            <div className="p-5 rounded-2xl bg-dark-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">1. Guardar y Exportar a Excel (.xlsx)</h4>
                    <p className="text-xs text-slate-400">Descarga un libro de cálculo con 5 hojas con toda la información</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={exportToExcel}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-black text-xs shadow-neon-green flex items-center gap-2 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Excel Completo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-400">
                <div className="p-2 rounded-lg bg-dark-900 border border-slate-800">📊 Hoja 1: Socios</div>
                <div className="p-2 rounded-lg bg-dark-900 border border-slate-800">💰 Hoja 2: Caja & Pagos</div>
                <div className="p-2 rounded-lg bg-dark-900 border border-slate-800">⚡ Hoja 3: Asistencias</div>
                <div className="p-2 rounded-lg bg-dark-900 border border-slate-800">🛒 Hoja 4: Tienda POS</div>
              </div>
            </div>

            {/* Action 2: Cloud Sync Button */}
            <div className="p-5 rounded-2xl bg-dark-950 border border-cyan-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <CloudUpload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">2. Subida Segura a la Nube (Cloud Sync)</h4>
                    <p className="text-xs text-slate-400">
                      Última copia en nube: <strong className="text-slate-200">{lastSyncedAt ? formatDateTime(lastSyncedAt) : 'Pendiente'}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSyncingCloud}
                  onClick={() => syncToCloud()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-dark-950 font-black text-xs shadow-neon-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                  <span>{isSyncingCloud ? 'Subiendo a la Nube...' : '☁️ Subir a la Nube Ahora'}</span>
                </button>
              </div>

              {pendingChangesCount > 0 ? (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                  <span>Hay <strong>{pendingChangesCount}</strong> cambios locales pendientes por sincronizar en la nube.</span>
                  {cloudConfig.autoSync && <span className="text-[10px] text-amber-400 font-mono">Auto-sync en 4s</span>}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tu base de datos local y la nube están 100% sincronizadas.</span>
                </div>
              )}
            </div>

            {/* Action 3: Restore / Import */}
            <div className="p-5 rounded-2xl bg-dark-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">3. Restaurar Base de Datos desde Respaldo</h4>
                    <p className="text-xs text-slate-400">Recupera toda la información si cambias de equipo o navegador</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportToJson}
                    className="px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar JSON</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isRestoring}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRestoring ? 'Cargando...' : 'Cargar Archivo'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Cloud Snapshots History */}
        {activeTab === 'snapshots' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Historial de copias de seguridad automáticas registradas en la nube:
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {cloudSnapshots.map(snap => (
                <div
                  key={snap.id}
                  className="p-3.5 rounded-xl bg-dark-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{snap.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {snap.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {formatDateTime(snap.timestamp)} • {snap.provider}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Socios</span>
                      <span className="font-bold text-white">{snap.membersCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Pagos</span>
                      <span className="font-bold text-emerald-400">{snap.transactionsCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Tamaño</span>
                      <span className="text-slate-400">{(snap.fileSizeBytes / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Cloud Provider Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Proveedor de Nube
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'titan_vault', label: 'Bóveda Cifrada Cloud', desc: 'AES-256 Cloud Mirror' },
                  { id: 'supabase', label: 'Supabase (Postgres)', desc: 'PostgreSQL en la nube' },
                  { id: 'webhook', label: 'Webhook REST API', desc: 'Servidor / Cloud Propio' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id as typeof provider)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      provider === p.id
                        ? 'border-cyan-500 bg-cyan-500/15 text-white'
                        : 'border-slate-800 bg-dark-950 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-cyan-400">{p.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {provider !== 'titan_vault' && (
              <div className="space-y-3 p-4 rounded-xl bg-dark-950 border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Endpoint URL de la Nube (API / Webhook / Supabase)
                  </label>
                  <input
                    type="url"
                    placeholder="https://tu-proyecto.supabase.co/rest/v1/... o https://api.tu-gimnasio.com/sync"
                    value={endpointUrl}
                    onChange={e => setEndpointUrl(e.target.value)}
                    className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    API Key / Bearer Token
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOi..."
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Auto-Sync Toggle */}
            <div className="p-4 rounded-xl bg-dark-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-white">Sincronización Automática en Segundo Plano</h5>
                <p className="text-[11px] text-slate-400">
                  Sube los cambios a la nube automáticamente 4 segundos después de cada cobro o check-in.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={e => setAutoSync(e.target.checked)}
                className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-dark-950 font-bold text-xs shadow-neon-green"
              >
                Guardar Configuración Cloud
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
