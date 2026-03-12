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

  return data.user;
}

// Add water usage
router.post('/add-usage', async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const user = await getUserFromToken(req, res);
    if (!user) return;

    const { date, liters } = req.body;

    if (!date || typeof liters !== 'number') {
      return res.status(400).json({ error: 'Date and liters are required' });
    }

    const { error } = await supabase.from('water_usage').insert({
      user_id: user.id,
      date,
      liters
    });

    if (error) throw error;

    return res.status(201).json({ message: 'Usage added successfully' });
  } catch (err) {
    return next(err);
  }
});

// Usage history
router.get('/usage-history', async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const user = await getUserFromToken(req, res);
    if (!user) return;

    const { data, error } = await supabase
      .from('water_usage')
      .select('id, date, liters, created_at')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// Graph data
router.get('/usage-graph', async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const user = await getUserFromToken(req, res);
    if (!user) return;

    const { data, error } = await supabase
      .from('water_usage')
      .select('date, liters')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// Usage summary
router.get('/usage-summary', async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const user = await getUserFromToken(req, res);
    if (!user) return;

    const { data, error } = await supabase
      .from('water_usage')
      .select('date, liters')
      .eq('user_id', user.id);

    if (error) throw error;

    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonth = todayStr.slice(0, 7);

    let totalToday = 0;
    let totalMonth = 0;
    let sum = 0;
    const daySet = new Set();

    (data || []).forEach((row) => {
      const d = row.date;
      const liters = Number(row.liters);
      if (d === todayStr) totalToday += liters;
      if (String(d).startsWith(thisMonth)) totalMonth += liters;
      sum += liters;
      daySet.add(d);
    });

    const avgDaily = daySet.size > 0 ? sum / daySet.size : 0;
    const isHigh = avgDaily > 0 && totalToday > avgDaily * 1.5;

    return res.json({
      totalToday,
      totalMonth,
      avgDaily,
      highUsageAlert: isHigh
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
