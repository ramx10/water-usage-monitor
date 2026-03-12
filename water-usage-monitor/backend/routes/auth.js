import express from 'express';
import { getSupabaseAdmin, getSupabaseAnon } from '../supabaseClient.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'user' }
    });

    if (authError) throw authError;

    const { error: insertError } = await supabase.from('users').insert({
      id: authUser.user.id,
      name,
      email,
      role: 'user'
    });

    if (insertError) throw insertError;

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const anonClient = getSupabaseAnon();

    const { data, error } = await anonClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return res.json(profile);
  } catch (err) {
    return next(err);
  }
});

export default router;

