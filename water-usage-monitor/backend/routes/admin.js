import express from 'express';
import { getSupabaseAdmin } from '../supabaseClient.js';

const router = express.Router();

async function getUserFromToken(req, res) {
  const supabase = getSupabaseAdmin();
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    res.status(403).json({ error: 'Unauthorized' });
    return null;
  }

  if (profile.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }

  return data.user;
}

router.get('/users', async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const adminUser = await getUserFromToken(req, res);
    if (!adminUser) return;

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

router.get('/usage', async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const adminUser = await getUserFromToken(req, res);
    if (!adminUser) return;

    const { data, error } = await supabase.rpc('water_usage_per_user');

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// Delete a user and all their usage records
router.delete('/users/:id', async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const adminUser = await getUserFromToken(req, res);
    if (!adminUser) return;

    const userId = req.params.id;

    // Prevent an admin from accidentally deleting themselves (optional safeguard)
    if (adminUser.id === userId) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    // Delete all water_usage rows for this user
    const { error: usageError } = await supabase
      .from('water_usage')
      .delete()
      .eq('user_id', userId);

    if (usageError) throw usageError;

    // Delete from public.users table
    const { error: userError } = await supabase.from('users').delete().eq('id', userId);
    if (userError) throw userError;

    // Also remove from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;

