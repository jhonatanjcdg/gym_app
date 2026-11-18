# ⚡ TITAN PULSE OS - Gym & Fitness Management SaaS

> Plataforma web moderna, responsiva y de alto rendimiento para la gestión integral de gimnasios, centros fitness y boxes de entrenamiento. Diseñada con una interfaz **Dark Mode** profesional con acentos neón esmeralda y cian, arquitectura **Local-First con exportación a Excel (.xlsx)** y **Sincronización Segura en la Nube**.

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-10b981)](#)

---

## 🌟 Características Principales

### 1. Control de Acceso, Membresías & Torniquete Virtual
- **Tres Modelos de Pago Integrados:**
  - **Mensualidad (Tiempo):** Cálculo automático de fecha de corte (30, 90 o 365 días) con alerta visual preventiva ($\le 3$ días).
  - **Tiquetera (Créditos de Entrada):** Saldo de sesiones (8, 12 o 20 entradas). Descuenta automáticamente 1 entrada por check-in.
  - **Pase Diario (Drop-in Express):** Registro rápido en 15 segundos sin papeleos con acceso inmediato.
- **Terminal de Check-in con Feedback Sensorial:**
  - Sintetizador de audio nativo (**Web Audio API**): acorde de doble tono (*Chime*) para acceso permitido y zumbido (*Sawtooth Buzz*) para acceso denegado.
  - Botón directo **"⚡ Renovar Ahora"** ante accesos denegados.
  - Botones demo de prueba rápida de 1-clic.

### 2. Seguridad en Dos Capas: Local (Excel .xlsx) + Nube (Cloud Sync)
- **Local-First:** Funciona de inmediato sin internet en disco local (`localStorage` y caché).
- **Exportación a Excel Completa (.xlsx):** Genera un libro real de cálculo con 5 hojas maestras (*Socios, Caja/Finanzas, Asistencias, Inventario y Equipos*).
- **Cloud Sync:** Sincronización automática en segundo plano con historial de versiones (*Snapshots* cifrados) y compatibilidad con Supabase o Webhook propio.
- **Restauración:** Carga de respaldo en 1 clic para no perder nunca la información.

### 3. Punto de Venta & Tienda (Mini-POS)
- Inventario de suplementos, bebidas energéticas, proteínas y accesorios con alertas de stock mínimo.
- Carrito con cálculo de subtotales, calculadora de cambio en efectivo y métodos múltiples (**Efectivo, Transferencia/Nequi/Daviplata, Tarjeta**).
- Sonido de caja y efectos de confeti.

### 4. Módulo Financiero & Cierre de Caja
- Flujo de caja diario, semanal y mensual con balance neto en tiempo real.
- **Cierre de Caja Diario:** Desglose del dinero en gaveta física vs. transferencias y datáfono.
- Registro de gastos operativos (mantenimiento, servicios públicos, nómina de entrenadores).
- Exportación de reportes a CSV e impresión directa de tickets.

### 5. Salud, Antropometría & Entrenamiento
- **Ficha Antropométrica:** Registro evolutivo de peso, grasa %, masa muscular y medidas corporales (cintura, pecho, cadera, brazo, muslo).
- Cálculo automático de **Índice de Masa Corporal (IMC)** con clasificación clínica.
- **Gestor de Rutinas:** Creación y asignación de planes de entrenamiento divididos por días, series, repeticiones, cargas en kg y descansos.
- **Agenda de Clases Grupales:** Calendario semanal (*Spinning, CrossFit, Yoga, Funcional, Boxeo, Pilates*) con control estricto de cupos máximos y reservas.

### 6. Roles y Mantenimiento de Máquinas
- **Control de Roles:** Switch dinámico entre **Super Administrador** (acceso irrestricto) y **Recepción / Entrenador** (operación diaria con finanzas confidenciales bloqueadas).
- **Inventario de Equipos:** Semáforo operativo (🟢 *Operativo*, 🟡 *En mantenimiento*, 🔴 *Fuera de servicio*) con control de fechas de revisión técnica.

---

## 🚀 Instalación y Puesta en Marcha

Clona el repositorio e instala las dependencias:

```bash
# 1. Clonar el repositorio
git clone https://github.com/jhonatanjcdg/gym_app.git

# 2. Entrar en la carpeta
cd gym_app

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en **`http://localhost:5173/`**.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, TypeScript, Vite
- **Estilos:** Tailwind CSS v3, Glassmorphism & Neon Glow Aesthetics
- **Iconos:** Lucide React
- **Hojas de Cálculo:** SheetJS (`xlsx`)
- **Efectos:** Canvas-Confetti
- **Audio:** Web Audio API (Sintetizador analógico de frecuencias en tiempo real)
- **Persistencia:** LocalStorage Engine + Cloud Sync Vault Mirror

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
Desarrollado para la gestión integral de gimnasios y centros de acondicionamiento físico.
