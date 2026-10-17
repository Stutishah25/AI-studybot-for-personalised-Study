import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { AcademicLevel, AcademicStream } from '../prompts.js';

const router = Router();

// Sign Up & Register
const handleSignUp = async (req: any, res: Response) => {
  try {
    const { email, password, name, academicLevel, stream } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter your name.' });
    }

    const validAcademicLevel: AcademicLevel = ['Middle School', 'High School', 'AP/IB', 'Undergrad', 'Postgrad'].includes(academicLevel)
      ? academicLevel
      : 'Undergrad';

    const validStream: AcademicStream = ['General', 'Computer Science', 'Pre-Med', 'Business/Econ', 'Humanities', 'Law'].includes(stream)
      ? stream
      : 'General';

    const newUser = db.createUser(email, password, name, validAcademicLevel, validStream, false);
    const token = db.generateToken(newUser);
    const profile = db.getUserProfile(newUser.id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        academicLevel: newUser.academicLevel,
        stream: newUser.stream,
        isDemo: false,
        created_at: newUser.created_at,
        createdAt: newUser.created_at
      },
      profile
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(400).json({ error: err.message || 'Could not create account.' });
  }
};

router.post('/signup', handleSignUp);
router.post('/register', handleSignUp);

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = db.verifyPassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = db.generateToken(user);
    const profile = db.getUserProfile(user.id);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        academicLevel: user.academicLevel || 'Undergrad',
        stream: user.stream || 'General',
        isDemo: Boolean(user.isDemo),
        created_at: user.created_at || user.createdAt,
        createdAt: user.created_at || user.createdAt
      },
      profile
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
});

// Demo Login for visitors / recruiters
router.post('/demo-login', async (req, res: Response) => {
  try {
    const demoUser = db.findUserByEmail('demo@nova.study');
    if (!demoUser) {
      return res.status(500).json({ error: 'Demo user not initialized.' });
    }

    const token = db.generateToken(demoUser);
    const profile = db.getUserProfile(demoUser.id);

    return res.json({
      success: true,
      token,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        academicLevel: demoUser.academicLevel || 'Undergrad',
        stream: demoUser.stream || 'Computer Science',
        isDemo: true,
        created_at: demoUser.created_at || demoUser.createdAt,
        createdAt: demoUser.created_at || demoUser.createdAt
      },
      profile
    });
  } catch (err: any) {
    console.error('Demo login error:', err);
    return res.status(500).json({ error: 'Failed to start demo.' });
  }
});

// Current Authenticated User & Profile
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const profile = db.getUserProfile(userId);
    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        academicLevel: user.academicLevel || 'Undergrad',
        stream: user.stream || 'General',
        isDemo: Boolean(user.isDemo),
        created_at: user.created_at || user.createdAt,
        createdAt: user.created_at || user.createdAt
      },
      profile
    });
  } catch (err: any) {
    console.error('Auth /me error:', err);
    return res.status(500).json({ error: 'Failed to load user profile.' });
  }
});

// Logout
router.post('/logout', (req, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
