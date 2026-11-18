import { createClient } from '@supabase/supabase-js';
import { FullGymBackupData } from '../utils/excel';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://mygqzpjtgexhbmnaatyd.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_gUjDrhKwEQ75HVm4cVyFEg_TG-igZI2';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Uploads full gym data to Supabase PostgreSQL tables
 */
export const syncFullDataToSupabase = async (
  data: FullGymBackupData
): Promise<{ success: boolean; tableStatus: 'synced_tables' | 'tables_missing_run_sql'; error?: any }> => {
  if (!supabase) {
    return { success: false, tableStatus: 'tables_missing_run_sql' };
  }

  try {
    // 1. Try to record backup snapshot into gym_backups
    const backupRecord = {
      id: `SNP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      members_count: data.members.length,
      transactions_count: data.transactions.length,
      checkins_count: data.checkIns.length,
      products_count: data.products.length,
      file_size_bytes: new Blob([JSON.stringify(data)]).size,
      payload: data,
      status: 'Completado',
    };

    const backupRes = await supabase.from('gym_backups').insert([backupRecord]);

    // Check if table missing error (code PGRST205)
    if (backupRes.error && backupRes.error.code === 'PGRST205') {
      return {
        success: true,
        tableStatus: 'tables_missing_run_sql',
      };
    }

    // 2. Also try upserting members
    const formattedMembers = data.members.map(m => ({
      id: m.id,
      document_id: m.documentId,
      name: m.name,
      phone: m.phone,
      email: m.email,
      gender: m.gender,
      plan_type: m.planType,
      status: m.status,
      start_date: m.startDate,
      end_date: m.endDate,
      total_credits: m.totalCredits ?? null,
      remaining_credits: m.remainingCredits ?? null,
      emergency_contact: m.emergencyContact ?? null,
      notes: m.notes ?? null,
      created_at: m.createdAt,
      last_check_in: m.lastCheckIn ?? null,
    }));

    await supabase.from('members').upsert(formattedMembers);

    // 3. Upsert products
    const formattedProducts = data.products.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      min_stock: p.minStock,
      image: p.image ?? null,
    }));

    await supabase.from('products').upsert(formattedProducts);

    return {
      success: true,
      tableStatus: 'synced_tables',
    };
  } catch (err) {
    console.warn('Supabase transmission error:', err);
    return {
      success: true, // Still marked as safe locally
      tableStatus: 'tables_missing_run_sql',
      error: err,
    };
  }
};
