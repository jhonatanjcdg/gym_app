-- ============================================================
-- TITAN PULSE OS - Esquema de Base de Datos para Supabase
-- Ejecuta este script en el "SQL Editor" de tu panel de Supabase
-- ============================================================

-- 1. Tabla de Socios
CREATE TABLE IF NOT EXISTS public.members (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gender TEXT,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_credits INT,
  remaining_credits INT,
  emergency_contact JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_check_in TIMESTAMPTZ
);

-- 2. Tabla de Caja y Finanzas
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  description TEXT,
  member_id TEXT,
  member_name TEXT,
  receipt_number TEXT NOT NULL
);

-- 3. Tabla de Asistencias (Check-ins de Torniquete)
CREATE TABLE IF NOT EXISTS public.checkins (
  id TEXT PRIMARY KEY,
  member_id TEXT,
  member_name TEXT,
  document_id TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL,
  reason TEXT,
  remaining_days INT,
  remaining_credits INT
);

-- 4. Tabla de Inventario de Tienda (Mini-POS)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  stock INT NOT NULL,
  min_stock INT NOT NULL,
  image TEXT
);

-- 5. Tabla de Equipos y Mantenimiento
CREATE TABLE IF NOT EXISTS public.equipment (
  id TEXT PRIMARY KEY,
  serial_number TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  notes TEXT
);

-- 6. Tabla de Respaldos Completos y Snapshots Cloud
CREATE TABLE IF NOT EXISTS public.gym_backups (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  members_count INT NOT NULL,
  transactions_count INT NOT NULL,
  checkins_count INT NOT NULL,
  products_count INT NOT NULL,
  file_size_bytes INT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'Completado'
);

-- Habilitar permisos de lectura y escritura para la clave pública anon
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_backups ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público anónimo (Permite sync desde la app)
CREATE POLICY "Permitir todo a usuarios anon en members" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios anon en transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios anon en checkins" ON public.checkins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios anon en products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios anon en equipment" ON public.equipment FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios anon en gym_backups" ON public.gym_backups FOR ALL USING (true) WITH CHECK (true);
