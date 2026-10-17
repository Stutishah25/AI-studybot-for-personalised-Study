import { Router, Request, Response } from 'express';
import { db, SubjectRecord, TopicRecord } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { GoogleGenAI } from '@google/genai';
import {
  AcademicLevel,
  AcademicStream,
  SYLLABUS_GENERATION_PROMPT,
  MASTER_LESSON_ENGINE_PROMPT,
  buildNovaSystemInstruction
} from '../prompts.js';

const router = Router();

function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

// -----------------------------------------------------------------
// 1. AUTHENTICATION & CLEAN REGISTRATION INITIALIZATION
// -----------------------------------------------------------------

/**
 * POST /api/v2/auth/register (also aliased as /api/v2/auth/signup)
 * Creates account and initializes storage directory with 100% clean, empty JSON files:
 *   subjects.json -> []
 *   notes.json -> []
 *   flashcards.json -> []
 *   study_plans.json -> []
 *   radar.json -> { topics: [], weakSpots: [] }
 */
const handleRegistration = async (req: Request, res: Response) => {
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

    const validAcademicLevel: AcademicLevel = [
      'Middle School',
      'High School',
      'AP/IB',
      'Undergrad',
      'Postgrad'
    ].includes(academicLevel)
      ? academicLevel
      : 'Undergrad';

    const validStream: AcademicStream = [
      'General',
      'Computer Science',
      'Pre-Med',
      'Business/Econ',
      'Humanities',
      'Law'
    ].includes(stream)
      ? stream
      : 'General';

    // createUser automatically calls db.initUserStorage with clean empty files:
    // subjects.json ([]), notes.json ([]), flashcards.json ([]), study_plans.json ([]), radar.json ({ topics: [], weakSpots: [] })
    const newUser = db.createUser(email, password, name, validAcademicLevel, validStream, false);
    const token = db.generateToken(newUser);
    const profile = db.getUserProfile(newUser.id);

    return res.status(201).json({
      success: true,
      message: 'Account created with 100% clean canvas.',
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
    console.error('Registration error:', err);
    return res.status(400).json({ error: err.message || 'Could not create account.' });
  }
};

router.post('/auth/register', handleRegistration);
router.post('/auth/signup', handleRegistration);

/**
 * POST /api/v2/auth/login
 */
router.post('/auth/login', async (req: Request, res: Response) => {
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

    // Ensure storage files exist and are isolated
    db.initUserStorage(user.id, false);

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

/**
 * POST /api/v2/auth/demo-login
 */
router.post('/auth/demo-login', async (req: Request, res: Response) => {
  try {
    const demoUser = db.findUserByEmail('demo@nova.study');
    if (!demoUser) {
      return res.status(500).json({ error: 'Demo user not initialized.' });
    }

    // Clean canvas guarantee
    db.initUserStorage(demoUser.id, false);

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

/**
 * GET /api/v2/auth/me
 */
router.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
    return res.status(500).json({ error: 'Could not fetch user profile.' });
  }
});

// -----------------------------------------------------------------
// 2. SUBJECTS API: 100% PERSISTENT & CLEAN USER ISOLATION
// -----------------------------------------------------------------

/**
 * GET /api/v2/subjects
 * Returns user-specific subjects. Returns [] if empty. Never falls back to demo.
 */
router.get('/subjects', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subjects = db.getUserSubjects(userId);
    return res.json({
      success: true,
      subjects: Array.isArray(subjects) ? subjects : [],
      count: Array.isArray(subjects) ? subjects.length : 0
    });
  } catch (err: any) {
    console.error('Error fetching subjects:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch subjects.' });
  }
});

/**
 * POST /api/v2/subjects
 * Accepts: { title: string, courseCode?: string, academicLevel: string, stream: string }
 * Auto-generates 6-8 syllabus topics via Gemini tailored to academicLevel and stream.
 * Saves subject directly to the user's personal subjects list.
 */
router.post('/subjects', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = db.findUserById(userId);
    const profile = db.getUserProfile(userId);

    const {
      title,
      courseCode,
      academicLevel: reqAcademicLevel,
      stream: reqStream,
      targetExamDate,
      description,
      color,
      accentColor,
      customNotes,
      presetTopics
    } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Subject title is required.' });
    }

    const cleanTitle = title.trim();
    const effectiveAcademicLevel: AcademicLevel =
      reqAcademicLevel || user?.academicLevel || profile?.academicLevel || 'Undergrad';
    const effectiveStream: AcademicStream =
      reqStream || user?.stream || profile?.stream || 'General';

    const cleanCourseCode =
      courseCode && courseCode.trim()
        ? courseCode.trim().toUpperCase()
        : `${cleanTitle.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'SUB'}101`;

    const cleanExamDate =
      targetExamDate ||
      new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0];

    let generatedTopics: TopicRecord[] = [];

    // If explicit preset topics were provided by user
    if (Array.isArray(presetTopics) && presetTopics.length > 0) {
      generatedTopics = presetTopics.map((pt, idx) => ({
        id: `t_${Date.now()}_${idx + 1}`,
        name: typeof pt === 'string' ? pt : pt.name || `Topic ${idx + 1}`,
        difficulty: (pt.difficulty || 'medium') as any,
        summary: pt.summary || `Core study module for ${cleanTitle}.`,
        quizScore: 0,
        confidenceScore: 30,
        status: 'not-started',
        lastReviewedDaysAgo: 0
      }));
    } else {
      // Auto-generate 6-8 starter syllabus topics tailored to academicLevel and stream via Gemini
      const ai = getAIClient();
      if (ai) {
        try {
          const systemInstruction = `${SYLLABUS_GENERATION_PROMPT}
Student Academic Profile:
- Academic Level: ${effectiveAcademicLevel}
- Academic Stream: ${effectiveStream}
- Specialization: Calibrate conceptual depth, mathematical formality, and practical focus specifically for ${effectiveAcademicLevel} students in ${effectiveStream}.`;

          const prompt = `Generate a high-yield syllabus curriculum for:
Subject: "${cleanTitle}"
Course Code: "${cleanCourseCode}"
Target Academic Level: "${effectiveAcademicLevel}" (e.g. Middle School vs High School vs AP/IB vs Undergrad vs Postgrad)
Academic Stream: "${effectiveStream}" (e.g. Computer Science vs Pre-Med vs Business/Econ vs Law vs Humanities vs General)
${customNotes ? `Student Notes / Syllabi Focus: "${customNotes}"` : ''}

CRITICAL REQUIREMENTS:
1. Provide exactly 6 to 8 structured syllabus topics.
2. Adapt vocabulary and difficulty strictly to ${effectiveAcademicLevel} in ${effectiveStream}.
3. Return pure JSON format:
{
  "topics": [
    {
      "name": "Topic Title",
      "difficulty": "easy" | "medium" | "hard",
      "summary": "1-2 sentence description of key concepts tested"
    }
  ]
}`;

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Syllabus generator timed out')), 8000)
          );

          const response = await Promise.race([
            ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                systemInstruction,
                responseMimeType: 'application/json'
              }
            }),
            timeoutPromise
          ]) as any;

          const parsed = JSON.parse(response.text || '{}');
          const rawTopics = Array.isArray(parsed.topics)
            ? parsed.topics
            : Array.isArray(parsed)
            ? parsed
            : [];

          if (rawTopics.length >= 4) {
            generatedTopics = rawTopics.slice(0, 8).map((t: any, idx: number) => ({
              id: `t_${Date.now()}_${idx + 1}`,
              name: t.name || `Topic ${idx + 1}`,
              difficulty: ['easy', 'medium', 'hard'].includes(t.difficulty)
                ? t.difficulty
                : idx < 2
                ? 'easy'
                : idx < 6
                ? 'medium'
                : 'hard',
              summary: t.summary || `Core study objectives for ${t.name || cleanTitle}.`,
              quizScore: 0,
              confidenceScore: 30,
              status: 'not-started',
              lastReviewedDaysAgo: 0
            }));
          }
        } catch (llmErr) {
          console.error('LLM syllabus generator error:', llmErr);
        }
      }

      // Dynamic fallback tailored to the requested stream and academic level if AI unavailable
      if (generatedTopics.length === 0) {
        const streamTopicsMap: Record<string, string[]> = {
          'Middle School': [
            `${cleanTitle} Introduction & Big Ideas`,
            'Key Definitions & Everyday Examples',
            'Core Processes & Simple Diagrams',
            'Hands-on Experiments & Observations',
            'Patterns, Problem Solving & Review',
            'Unit Review & Self-Quiz'
          ],
          'High School': [
            `Foundational Principles of ${cleanTitle}`,
            'Key Concepts, Laws & Formulas',
            'Step-by-step Problem Solving & Methods',
            'Real-world Case Studies & Lab Investigations',
            'Common Exam Questions & Tricky Scenarios',
            'Unit Synthesis & Practice Exam'
          ],
          'AP/IB': [
            `${cleanTitle} Framework & Unit Overview`,
            'Thematic Analysis & Quantitative Invariants',
            'Document/Data Analysis & Structured Free-Response',
            'Advanced Multi-step Problem Solving',
            'Cross-topic Synthesis & Edge Cases',
            'AP/IB Exam Rubric Practice & Timing'
          ],
          'Undergrad': [
            `Theoretical Foundations of ${cleanTitle}`,
            'Core Invariants, Mechanisms & Models',
            'Analytical Frameworks & Algorithmic/Mathematical Methods',
            'Edge Cases, Boundary Conditions & System Architecture',
            'Applied Empirical Problem Sets & Case Studies',
            'Comprehensive Synthesis & Final Exam Prep'
          ],
          'Postgrad': [
            `Epistemological & Theoretical Limits of ${cleanTitle}`,
            'Advanced Mathematical Formalisms & Primary Literature',
            'Mechanistic Nuance, Trade-offs & Structural Optimization',
            'Complex Multimodal Problem Decomposition',
            'Critique of Assumptions & Paradigmatic Edge Cases',
            'Graduate Comprehensive Defense & Synthesis'
          ]
        };

        const list = streamTopicsMap[effectiveAcademicLevel] || streamTopicsMap['Undergrad'];
        generatedTopics = list.map((tName, idx) => ({
          id: `t_${Date.now()}_${idx + 1}`,
          name: tName,
          difficulty: idx < 2 ? 'easy' : idx < 5 ? 'medium' : 'hard',
          summary: `Curriculum unit for ${tName} calibrated to ${effectiveAcademicLevel} ${effectiveStream}.`,
          quizScore: 0,
          confidenceScore: 30,
          status: 'not-started',
          lastReviewedDaysAgo: 0
        }));
      }
    }

    const half = Math.ceil(generatedTopics.length / 2);
    const units = [
      {
        id: `u_${Date.now()}_1`,
        unitNumber: 1,
        title: `${cleanTitle} Part I: Foundations & Core Concepts`,
        topics: generatedTopics.slice(0, half)
      },
      {
        id: `u_${Date.now()}_2`,
        unitNumber: 2,
        title: `${cleanTitle} Part II: Applications & Synthesis`,
        topics: generatedTopics.slice(half)
      }
    ];

    const palettes = [
      { color: 'cyan', accent: '#38bdf8' },
      { color: 'violet', accent: '#a78bfa' },
      { color: 'emerald', accent: '#34d399' },
      { color: 'amber', accent: '#fbbf24' },
      { color: 'rose', accent: '#fb7185' },
      { color: 'indigo', accent: '#818cf8' }
    ];
    const picked = palettes[Math.floor(Math.random() * palettes.length)];

    const newSubject = db.addSubject(userId, {
      title: cleanTitle,
      name: cleanTitle,
      courseCode: cleanCourseCode,
      code: cleanCourseCode,
      targetExamDate: cleanExamDate,
      topics: generatedTopics,
      units,
      progress: 0,
      description:
        description ||
        `Curriculum in ${cleanTitle} calibrated to ${effectiveAcademicLevel} (${effectiveStream}) with ${generatedTopics.length} syllabus topics.`,
      color: color || picked.color,
      accentColor: accentColor || picked.accent
    });

    const allSubjects = db.getUserSubjects(userId);

    return res.status(201).json({
      success: true,
      message: 'Subject added successfully.',
      subject: newSubject,
      subjects: allSubjects
    });
  } catch (err: any) {
    console.error('Error creating subject:', err);
    return res.status(500).json({ error: err.message || 'Failed to create subject.' });
  }
});

/**
 * GET /api/v2/subjects/:id
 * Returns ONLY the selected subject's data for the authenticated user.
 * If not found or if the user has no subjects, returns 404. Never defaults to demo data.
 */
router.get('/subjects/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subjectId = req.params.id;
    const subjects = db.getUserSubjects(userId);

    const subject = subjects.find(
      s => s.id === subjectId || (s as any).courseCode?.toLowerCase() === subjectId.toLowerCase()
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found.',
        subject: null
      });
    }

    return res.json({
      success: true,
      subject
    });
  } catch (err: any) {
    console.error('Error fetching subject by id:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch subject.' });
  }
});

/**
 * DELETE /api/v2/subjects/:id
 */
router.delete('/subjects/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subjectId = req.params.id;

    const removed = db.deleteSubject(userId, subjectId);
    if (!removed) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    const updated = db.getUserSubjects(userId);
    return res.json({
      success: true,
      message: 'Subject deleted successfully.',
      subjects: updated
    });
  } catch (err: any) {
    console.error('Error deleting subject:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete subject.' });
  }
});

// -----------------------------------------------------------------
// 3. NOTES API: 100% PERSISTENT & CLEAN USER ISOLATION
// -----------------------------------------------------------------

/**
 * GET /api/v2/notes
 * Returns user's notes from notes.json. Returns [] if empty. Never falls back to demo.
 */
router.get('/notes', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notes = db.getUserCollection<any[]>(userId, 'notes', []);
    return res.json({
      success: true,
      notes: Array.isArray(notes) ? notes : [],
      count: Array.isArray(notes) ? notes.length : 0
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch notes.' });
  }
});

/**
 * POST /api/v2/notes
 */
router.post('/notes', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteData = req.body;
    const currentNotes = db.getUserCollection<any[]>(userId, 'notes', []);

    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: noteData.title || 'Untitled Study Note',
      subject: noteData.subject || 'General Studies',
      topic: noteData.topic || 'General Topic',
      type: noteData.type || noteData.noteType || 'study-notes',
      noteType: noteData.noteType || noteData.type || 'study-notes',
      length: noteData.length || 'detailed',
      summary: noteData.summary || '',
      content: noteData.content || '',
      tags: noteData.tags || [],
      createdAt: 'Just now'
    };

    currentNotes.unshift(newNote);
    db.saveUserCollection(userId, 'notes', currentNotes);

    return res.status(201).json({
      success: true,
      note: newNote,
      notes: currentNotes
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save note.' });
  }
});

/**
 * PUT /api/v2/notes/:id
 */
router.put('/notes/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;
    const currentNotes = db.getUserCollection<any[]>(userId, 'notes', []);
    const idx = currentNotes.findIndex(n => n.id === noteId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    currentNotes[idx] = { ...currentNotes[idx], ...req.body, id: noteId };
    db.saveUserCollection(userId, 'notes', currentNotes);

    return res.json({
      success: true,
      note: currentNotes[idx],
      notes: currentNotes
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update note.' });
  }
});

/**
 * DELETE /api/v2/notes/:id
 */
router.delete('/notes/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;
    const currentNotes = db.getUserCollection<any[]>(userId, 'notes', []);
    const filtered = currentNotes.filter(n => n.id !== noteId);
    db.saveUserCollection(userId, 'notes', filtered);

    return res.json({
      success: true,
      notes: filtered
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete note.' });
  }
});

// -----------------------------------------------------------------
// 4. FLASHCARDS API: 100% PERSISTENT & CLEAN USER ISOLATION
// -----------------------------------------------------------------

/**
 * GET /api/v2/flashcards
 * Returns user's flashcards from flashcards.json. Returns [] if empty. Never falls back to demo.
 */
router.get('/flashcards', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const flashcards = db.getUserCollection<any[]>(userId, 'flashcards', []);
    return res.json({
      success: true,
      flashcards: Array.isArray(flashcards) ? flashcards : [],
      count: Array.isArray(flashcards) ? flashcards.length : 0
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch flashcards.' });
  }
});

/**
 * POST /api/v2/flashcards
 * Appends single flashcard or array of flashcards to user's flashcards.json.
 */
router.post('/flashcards', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const currentFlashcards = db.getUserCollection<any[]>(userId, 'flashcards', []);

    if (Array.isArray(req.body.flashcards)) {
      const added = req.body.flashcards.map((fc: any, i: number) => ({
        id: fc.id || `fc_${Date.now()}_${i}`,
        front: fc.front || 'Question',
        back: fc.back || 'Answer',
        hint: fc.hint || '',
        mnemonic: fc.mnemonic || '',
        difficulty: fc.difficulty || 'medium',
        subject: fc.subject || req.body.subject || 'General Studies',
        topic: fc.topic || req.body.topic || 'General Topic',
        createdAt: new Date().toISOString()
      }));
      currentFlashcards.push(...added);
    } else {
      const newFc = {
        id: req.body.id || `fc_${Date.now()}`,
        front: req.body.front || 'Question',
        back: req.body.back || 'Answer',
        hint: req.body.hint || '',
        mnemonic: req.body.mnemonic || '',
        difficulty: req.body.difficulty || 'medium',
        subject: req.body.subject || 'General Studies',
        topic: req.body.topic || 'General Topic',
        createdAt: new Date().toISOString()
      };
      currentFlashcards.unshift(newFc);
    }

    db.saveUserCollection(userId, 'flashcards', currentFlashcards);

    return res.status(201).json({
      success: true,
      flashcards: currentFlashcards
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save flashcards.' });
  }
});

/**
 * DELETE /api/v2/flashcards/:id
 */
router.delete('/flashcards/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;
    const current = db.getUserCollection<any[]>(userId, 'flashcards', []);
    const filtered = current.filter(fc => fc.id !== id);
    db.saveUserCollection(userId, 'flashcards', filtered);

    return res.json({
      success: true,
      flashcards: filtered
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete flashcard.' });
  }
});

// -----------------------------------------------------------------
// 5. RADAR & WEAK-SPOT API: 100% PERSISTENT & CLEAN USER ISOLATION
// -----------------------------------------------------------------

/**
 * GET /api/v2/radar
 * Returns radar.json ({ topics: [], weakSpots: [] }). Returns empty state if empty. Never falls back to demo.
 */
router.get('/radar', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const radar = db.getUserCollection<any>(userId, 'radar', { topics: [], weakSpots: [] });
    const revisionRadar = db.getUserCollection<any[]>(userId, 'revision_radar', []);

    return res.json({
      success: true,
      radar: radar || { topics: [], weakSpots: [] },
      revisionRadar: Array.isArray(revisionRadar) ? revisionRadar : [],
      topics: radar.topics || [],
      weakSpots: radar.weakSpots || []
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch radar.' });
  }
});

/**
 * POST /api/v2/radar
 */
router.post('/radar', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const currentRadar = db.getUserCollection<any>(userId, 'radar', { topics: [], weakSpots: [] });
    const updated = {
      ...currentRadar,
      ...req.body,
      topics: req.body.topics || currentRadar.topics || [],
      weakSpots: req.body.weakSpots || currentRadar.weakSpots || []
    };
    db.saveUserCollection(userId, 'radar', updated);

    return res.json({
      success: true,
      radar: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update radar.' });
  }
});

// -----------------------------------------------------------------
// 6. STUDY PLANS API
// -----------------------------------------------------------------

/**
 * GET /api/v2/study-plans
 * Returns study_plans.json ([]). Returns [] if empty. Never falls back to demo.
 */
router.get('/study-plans', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const studyPlans = db.getUserCollection<any[]>(userId, 'study_plans', []);
    return res.json({
      success: true,
      studyPlans: Array.isArray(studyPlans) ? studyPlans : []
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch study plans.' });
  }
});

/**
 * PUT /api/v2/study-plans
 */
router.put('/study-plans', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { studyPlans, studyPlan } = req.body;
    const list = Array.isArray(studyPlans) ? studyPlans : Array.isArray(studyPlan) ? studyPlan : [];
    db.saveUserCollection(userId, 'study_plans', list);
    db.saveUserCollection(userId, 'study_plan', list);

    return res.json({
      success: true,
      studyPlans: list
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update study plan.' });
  }
});

// -----------------------------------------------------------------
// 7. UNIVERSAL MASTER LESSON & TOPIC CONTENT GENERATOR
// -----------------------------------------------------------------

/**
 * Interface for the structured Lesson Content payload
 */
export interface TopicLessonPayload {
  topicTitle: string;
  academicLevel: string;
  summary: string;
  realWorldAnalogy: string;
  keyConcepts: Array<{
    title: string;
    explanation: string;
    keyTerms: string[];
  }>;
  formulasOrRules: string[];
  workedExample: {
    problem: string;
    stepByStepSolution: string[];
    finalAnswer: string;
  };
  examPitfalls: string[];
  activeRecallQuestions: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * Generates an exhaustive, high-density lesson breakdown for ANY query or topic
 */
async function generateMasterTopicContent(params: {
  topicTitle: string;
  subjectTitle?: string;
  academicLevel?: string;
  stream?: string;
}): Promise<TopicLessonPayload> {
  const { topicTitle, subjectTitle = 'General Studies', academicLevel = 'Undergrad', stream = 'General' } = params;
  const ai = getAIClient();

  if (ai) {
    try {
      const prompt = `Act as the core AI Engine for "NOVA", an elite, universal educational platform.
Your goal is to provide a comprehensive, master-level educational breakdown for the following topic:

Topic: "${topicTitle}"
Course/Subject Context: "${subjectTitle}"
Student Academic Level: "${academicLevel}" (e.g. Middle School, High School, AP/IB, Undergrad, Postgrad)
Academic Stream: "${stream}" (e.g. Computer Science, Pre-Med, Engineering, Business/Econ, Humanities, Law, General)

MANDATORY GENERATION PRINCIPLES:
1. EXHAUSTIVE, HIGH-DENSITY CONTENT COVERAGE:
   - Never provide brief or superficial summaries unless explicitly requested.
   - Break down every searched topic into structured modules matching the JSON schema below:
     * 📌 Core Definition & High-Level Intuition (explained simply with a real-world analogy).
     * 🧠 Deep-Dive Conceptual Breakdown (key principles, underlying theory, mechanism/process).
     * 📐 Essential Formulas, Equations, or Core Theorems (with variable definitions where applicable).
     * 💡 Worked Example / Step-by-Step Problem Walkthrough.
     * ⚡ Common Pitfalls, Edge Cases & Misconceptions students often face in exams.
     * 📝 Quick Active-Recall Questions (3-5 flashcard-style Q&As for immediate self-testing).
2. ADAPTIVE PERSONA & STREAM MATCHING:
   - For Middle/High School: Highly visual, intuitive, step-by-step analogies, relatable everyday examples.
   - For College/Undergrad/Postgrad: Rigorous, domain-specific terminology, technical proofs, practical industry or research applications.
3. FRIENDLY, PEER-LIKE TUTOR TONALITY:
   - Maintain a warm, encouraging, grounded, and clear conversational tone.
   - Act like an exceptionally smart, patient study partner or teaching assistant. Avoid sounding robotic, dry, or excessively clinical.

CRITICAL: Return ONLY a valid JSON object matching this exact schema:
{
  "topicTitle": "${topicTitle}",
  "academicLevel": "${academicLevel}",
  "summary": "String",
  "realWorldAnalogy": "String",
  "keyConcepts": [
    { "title": "String", "explanation": "String", "keyTerms": ["String"] }
  ],
  "formulasOrRules": ["String"],
  "workedExample": {
    "problem": "String",
    "stepByStepSolution": ["String"],
    "finalAnswer": "String"
  },
  "examPitfalls": ["String"],
  "activeRecallQuestions": [
    { "question": "String", "answer": "String" }
  ]
}`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('LLM call timed out')), 8000)
      );

      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: MASTER_LESSON_ENGINE_PROMPT,
            responseMimeType: 'application/json'
          }
        }),
        timeoutPromise
      ]) as any;

      const parsed = JSON.parse(response.text || '{}');
      if (parsed && parsed.summary && Array.isArray(parsed.keyConcepts)) {
        return {
          topicTitle: parsed.topicTitle || topicTitle,
          academicLevel: parsed.academicLevel || academicLevel,
          summary: parsed.summary,
          realWorldAnalogy: parsed.realWorldAnalogy || `Think of ${topicTitle} as a fundamental building block in ${subjectTitle}.`,
          keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
          formulasOrRules: Array.isArray(parsed.formulasOrRules) ? parsed.formulasOrRules : [],
          workedExample: parsed.workedExample || {
            problem: `Applied problem for ${topicTitle}`,
            stepByStepSolution: [`Identify key inputs and constraints in ${subjectTitle}`],
            finalAnswer: `Verified outcome for ${topicTitle}`
          },
          examPitfalls: Array.isArray(parsed.examPitfalls) ? parsed.examPitfalls : [],
          activeRecallQuestions: Array.isArray(parsed.activeRecallQuestions) ? parsed.activeRecallQuestions : []
        };
      }
    } catch (err) {
      console.error('LLM error in generateMasterTopicContent:', err);
    }
  }

  // Dynamic contextual fallback calibrated to requested stream & grade level (NEVER hardcoded trees/DSA)
  const isK12 = academicLevel === 'Middle School' || academicLevel === 'High School';
  
  return {
    topicTitle,
    academicLevel,
    summary: `${topicTitle} is a core foundational pillar in ${subjectTitle}. It establishes how fundamental systems, models, and analytical invariants interact to predict outcomes and solve domain challenges.`,
    realWorldAnalogy: isK12
      ? `Imagine ${topicTitle} like a clear set of traffic rules or building blocks: each part has an exact job, and when they fit together properly, everything runs smoothly and without collisions.`
      : `Consider ${topicTitle} as an architectural invariant: it acts as a governed constraint layer that ensures stability, predictability, and efficiency across applied scenarios in ${stream}.`,
    keyConcepts: [
      {
        title: `Core Architecture & Principles of ${topicTitle}`,
        explanation: `The foundational mechanics involve understanding primary definitions, state transitions, and governing parameters in ${subjectTitle}.`,
        keyTerms: ['Core Principle', 'Governing Invariant', 'State Transition', 'Scope Boundary']
      },
      {
        title: `Operational Mechanics & Process Flow`,
        explanation: `How ${topicTitle} is applied step-by-step in problem-solving and empirical evaluations, from initial boundary checks to execution.`,
        keyTerms: ['Stepwise Execution', 'Input Validation', 'Optimization', 'Verification']
      },
      {
        title: `Edge Conditions & System Dynamics`,
        explanation: `Analyzing limiting behaviors, extreme constraints, and common points of failure when evaluating ${topicTitle}.`,
        keyTerms: ['Boundary Conditions', 'Degradation', 'Error Handling', 'Stability']
      }
    ],
    formulasOrRules: [
      `Rule 1 (Invariant Preservation): Verify all prerequisite conditions before executing transformations on ${topicTitle}.`,
      `Rule 2 (Boundary Checking): Always test extreme values (minimum, zero, maximum) to avoid runtime or conceptual invalidation.`,
      `Rule 3 (Dimensional & Unit Consistency): Ensure theoretical and mathematical consistency across all problem terms.`
    ],
    workedExample: {
      problem: `Given a standard scenario involving ${topicTitle} in ${subjectTitle}, how do we evaluate and resolve the primary operational objective?`,
      stepByStepSolution: [
        `Step 1: Parse the problem statement to identify known inputs, constraints, and the target output for ${topicTitle}.`,
        `Step 2: Select the governing formula or conceptual framework applicable to ${stream}.`,
        `Step 3: Substitute the parameters while tracking intermediate values and boundary constraints.`,
        `Step 4: Verify the result against standard edge cases and ensure semantic validity.`
      ],
      finalAnswer: `The system successfully converges to the expected stable state, confirming the theoretical model of ${topicTitle}.`
    },
    examPitfalls: [
      `Conflating foundational definitions with advanced special cases without checking prerequisites.`,
      `Overlooking boundary conditions or edge cases where standard formulas no longer hold directly.`,
      `Failing to clearly state intermediate assumptions during multi-step exam walkthroughs.`
    ],
    activeRecallQuestions: [
      {
        question: `What is the core definition and primary objective of ${topicTitle}?`,
        answer: `It establishes the fundamental governing principles and rules for managing interactions and outcomes in ${subjectTitle}.`
      },
      {
        question: `How should boundary conditions be tested when applying ${topicTitle}?`,
        answer: `By evaluating the behavior at minimum, maximum, and threshold limits to guarantee invariant safety.`
      },
      {
        question: `What is the most frequent misconception students face when answering exam questions on ${topicTitle}?`,
        answer: `Assuming that default conditions apply universally without validating prerequisite constraints.`
      }
    ]
  };
}

/**
 * POST /api/v2/generate-topic-content
 * Accepts: { subjectTitle: string, topicTitle: string, academicLevel?: string, stream?: string }
 * Returns structured master lesson payload with full intuition, breakdown, worked example, and recall questions.
 */
router.post('/generate-topic-content', async (req: Request, res: Response) => {
  try {
    const { subjectTitle, topicTitle, academicLevel, stream } = req.body;

    if (!topicTitle || typeof topicTitle !== 'string' || !topicTitle.trim()) {
      return res.status(400).json({ error: 'topicTitle is required.' });
    }

    const lesson = await generateMasterTopicContent({
      topicTitle: topicTitle.trim(),
      subjectTitle: subjectTitle ? String(subjectTitle).trim() : 'Coursework',
      academicLevel: academicLevel ? String(academicLevel).trim() : 'Undergrad',
      stream: stream ? String(stream).trim() : 'General'
    });

    return res.json({
      success: true,
      data: lesson,
      lesson
    });
  } catch (err: any) {
    console.error('Error in /api/v2/generate-topic-content:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate topic content.' });
  }
});

/**
 * POST /api/v2/search-topic
 * Universal search & breakdown endpoint for any academic query
 */
router.post('/search-topic', async (req: Request, res: Response) => {
  try {
    const { query, topic, subject, academicLevel, stream } = req.body;
    const targetTopic = (query || topic || '').trim();

    if (!targetTopic) {
      return res.status(400).json({ error: 'Search query or topic is required.' });
    }

    const lesson = await generateMasterTopicContent({
      topicTitle: targetTopic,
      subjectTitle: subject || 'General Studies',
      academicLevel: academicLevel || 'Undergrad',
      stream: stream || 'General'
    });

    return res.json({
      success: true,
      data: lesson,
      lesson
    });
  } catch (err: any) {
    console.error('Error in /api/v2/search-topic:', err);
    return res.status(500).json({ error: err.message || 'Search breakdown error.' });
  }
});

export default router;
