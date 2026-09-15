import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// Apply requireAuth to all data routes
router.use(requireAuth);

function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

// -------------------------------------------------------------
// USER PROFILE
// -------------------------------------------------------------
router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updated = db.saveUserProfile(userId, req.body);
    return res.json({ success: true, profile: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update profile.' });
  }
});

// -------------------------------------------------------------
// SUBJECTS & SYLLABUS
// -------------------------------------------------------------
router.get('/subjects', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subjects = db.getUserCollection(userId, 'subjects', []);
    return res.json({ success: true, subjects });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch subjects.' });
  }
});

router.post('/subjects', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, code, description, color, accentColor, units } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Subject name is required.' });
    }

    const currentSubjects = db.getUserCollection<any[]>(userId, 'subjects', []);
    const newSubject = {
      id: `subj_${Date.now()}`,
      name: name.trim(),
      code: code ? code.trim() : `SUB${currentSubjects.length + 1}`,
      description: description || `Curriculum units and topics for ${name}.`,
      progress: 0,
      color: color || 'indigo',
      accentColor: accentColor || '#818cf8',
      units: units || [
        {
          id: `u_${Date.now()}_1`,
          unitNumber: 1,
          title: 'Unit 1: Fundamentals',
          topics: [
            {
              id: `t_${Date.now()}_1`,
              name: 'Core Introduction',
              unitId: `u_${Date.now()}_1`,
              subjectId: `subj_${Date.now()}`,
              status: 'needs-revision',
              quizScore: 0,
              confidenceScore: 40,
              lastReviewedDaysAgo: 1,
              difficulty: 'medium',
              notesCount: 0
            }
          ]
        }
      ]
    };

    currentSubjects.push(newSubject);
    db.saveUserCollection(userId, 'subjects', currentSubjects);

    // Also update profile subjects list
    const profile = db.getUserProfile(userId);
    const existingSubjectNames = currentSubjects.map(s => s.name);
    db.saveUserProfile(userId, { ...profile, subjects: existingSubjectNames } as any);

    return res.status(201).json({ success: true, subject: newSubject, subjects: currentSubjects });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create subject.' });
  }
});

router.put('/subjects/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subjectId = req.params.id;
    const currentSubjects = db.getUserCollection<any[]>(userId, 'subjects', []);
    const idx = currentSubjects.findIndex(s => s.id === subjectId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    currentSubjects[idx] = { ...currentSubjects[idx], ...req.body, id: subjectId };
    db.saveUserCollection(userId, 'subjects', currentSubjects);
    return res.json({ success: true, subject: currentSubjects[idx], subjects: currentSubjects });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update subject.' });
  }
});

router.delete('/subjects/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subjectId = req.params.id;
    const currentSubjects = db.getUserCollection<any[]>(userId, 'subjects', []);
    const filtered = currentSubjects.filter(s => s.id !== subjectId);
    db.saveUserCollection(userId, 'subjects', filtered);

    // Update profile
    const profile = db.getUserProfile(userId);
    const existingSubjectNames = filtered.map(s => s.name);
    db.saveUserProfile(userId, { ...profile, subjects: existingSubjectNames } as any);

    return res.json({ success: true, subjects: filtered });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete subject.' });
  }
});

// AI Syllabus Parser: converts raw syllabus text into structured units & topics
router.post('/subjects/parse-syllabus', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { syllabusText, subjectName } = req.body;
    if (!syllabusText) {
      return res.status(400).json({ error: 'Syllabus text is required.' });
    }

    const ai = getAIClient();
    if (ai) {
      const prompt = `Convert this college syllabus for "${subjectName || 'the course'}" into a clean, structured JSON array of units with their sub-topics.
Syllabus text:
"""${syllabusText}"""

Response format:
[
  {
    "unitNumber": 1,
    "title": "Unit 1: Title",
    "topics": ["Topic 1", "Topic 2", "Topic 3"]
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsedUnits = JSON.parse(response.text || '[]');
      return res.json({ success: true, units: parsedUnits });
    }

    // Fallback parser if Gemini key is not configured
    const lines = syllabusText.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const units = [
      {
        unitNumber: 1,
        title: lines[0] || 'Unit 1: Fundamentals',
        topics: lines.slice(1, 6).map((l: string) => l.replace(/^[-*•\d.]+\s*/, '')) || ['Core Concepts']
      }
    ];
    return res.json({ success: true, units });
  } catch (err: any) {
    console.error('Parse syllabus error:', err);
    return res.status(500).json({ error: err.message || 'Failed to parse syllabus.' });
  }
});

// -------------------------------------------------------------
// NOTES
// -------------------------------------------------------------
router.get('/notes', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notes = db.getUserCollection(userId, 'notes', []);
    return res.json({ success: true, notes });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch notes.' });
  }
});

router.post('/notes', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteData = req.body;
    const currentNotes = db.getUserCollection<any[]>(userId, 'notes', []);
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: noteData.title || 'Untitled Study Note',
      subject: noteData.subject || 'General',
      topic: noteData.topic || 'General',
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
    return res.status(201).json({ success: true, note: newNote, notes: currentNotes });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save note.' });
  }
});

router.put('/notes/:id', async (req: AuthenticatedRequest, res: Response) => {
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
    return res.json({ success: true, note: currentNotes[idx], notes: currentNotes });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update note.' });
  }
});

router.delete('/notes/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;
    const currentNotes = db.getUserCollection<any[]>(userId, 'notes', []);
    const filtered = currentNotes.filter(n => n.id !== noteId);
    db.saveUserCollection(userId, 'notes', filtered);
    return res.json({ success: true, notes: filtered });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete note.' });
  }
});

// -------------------------------------------------------------
// MIND MAPS
// -------------------------------------------------------------
router.get('/mind-maps', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const mindMaps = db.getUserCollection(userId, 'mind_maps', {});
    return res.json({ success: true, mindMaps });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch mind maps.' });
  }
});

router.post('/mind-maps', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { key, data } = req.body;
    const currentMindMaps = db.getUserCollection<Record<string, any>>(userId, 'mind_maps', {});
    const mapKey = key || 'default';
    currentMindMaps[mapKey] = data;
    db.saveUserCollection(userId, 'mind_maps', currentMindMaps);
    return res.json({ success: true, mindMaps: currentMindMaps });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save mind map.' });
  }
});

// -------------------------------------------------------------
// MEMORY SHORTCUTS
// -------------------------------------------------------------
router.get('/memory-shortcuts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const shortcuts = db.getUserCollection(userId, 'memory_shortcuts', []);
    return res.json({ success: true, memoryShortcuts: shortcuts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch memory shortcuts.' });
  }
});

router.post('/memory-shortcuts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const currentShortcuts = db.getUserCollection<any[]>(userId, 'memory_shortcuts', []);
    const newShortcut = {
      id: `sc_${Date.now()}`,
      ...req.body
    };
    currentShortcuts.unshift(newShortcut);
    db.saveUserCollection(userId, 'memory_shortcuts', currentShortcuts);
    return res.status(201).json({ success: true, memoryShortcut: newShortcut, memoryShortcuts: currentShortcuts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save shortcut.' });
  }
});

router.delete('/memory-shortcuts/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;
    const currentShortcuts = db.getUserCollection<any[]>(userId, 'memory_shortcuts', []);
    const filtered = currentShortcuts.filter(s => s.id !== id);
    db.saveUserCollection(userId, 'memory_shortcuts', filtered);
    return res.json({ success: true, memoryShortcuts: filtered });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete shortcut.' });
  }
});

// -------------------------------------------------------------
// EXAMS & REVISION PLAN
// -------------------------------------------------------------
router.get('/exam-plan', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const examPlan = db.getUserCollection(userId, 'exam_plan', { upcomingExams: [], dailySchedule: [], priorityTopics: [] });
    return res.json({ success: true, examPlan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch exam plan.' });
  }
});

router.post('/exams', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { subject, date, targetGrade } = req.body;
    if (!subject || !date) {
      return res.status(400).json({ error: 'Subject and date are required.' });
    }

    const examPlan = db.getUserCollection<any>(userId, 'exam_plan', { upcomingExams: [], dailySchedule: [], priorityTopics: [] });
    const examDate = new Date(date);
    const now = new Date();
    const diffTime = examDate.getTime() - now.getTime();
    const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const newExam = {
      subject,
      date,
      daysLeft,
      targetGrade: targetGrade || 'A'
    };

    examPlan.upcomingExams.push(newExam);
    // Sort upcoming exams by daysLeft ascending
    examPlan.upcomingExams.sort((a: any, b: any) => a.daysLeft - b.daysLeft);

    db.saveUserCollection(userId, 'exam_plan', examPlan);
    return res.json({ success: true, examPlan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to add exam.' });
  }
});

router.delete('/exams/:index', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const idx = parseInt(req.params.index, 10);
    const examPlan = db.getUserCollection<any>(userId, 'exam_plan', { upcomingExams: [], dailySchedule: [], priorityTopics: [] });
    if (idx >= 0 && idx < examPlan.upcomingExams.length) {
      examPlan.upcomingExams.splice(idx, 1);
      db.saveUserCollection(userId, 'exam_plan', examPlan);
    }
    return res.json({ success: true, examPlan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete exam.' });
  }
});

// -------------------------------------------------------------
// REVISION RADAR (Spaced Repetition)
// -------------------------------------------------------------
router.get('/revision-radar', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const radar = db.getUserCollection(userId, 'revision_radar', []);
    return res.json({ success: true, revisionRadar: radar });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch revision radar.' });
  }
});

router.post('/revision-radar/reviewed', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { topic } = req.body;
    const radar = db.getUserCollection<any[]>(userId, 'revision_radar', []);
    const item = radar.find(r => r.topic.toLowerCase() === (topic || '').toLowerCase());
    if (item) {
      item.lastReviewedDaysAgo = 0;
      item.retentionEstimate = 95;
      item.status = 'reviewed';
      item.urgency = 'low';
      db.saveUserCollection(userId, 'revision_radar', radar);
    }
    return res.json({ success: true, revisionRadar: radar });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update review status.' });
  }
});

// -------------------------------------------------------------
// STUDY PLAN
// -------------------------------------------------------------
router.get('/study-plan', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const studyPlan = db.getUserCollection(userId, 'study_plan', []);
    return res.json({ success: true, studyPlan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch study plan.' });
  }
});

router.put('/study-plan', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { studyPlan } = req.body;
    db.saveUserCollection(userId, 'study_plan', studyPlan);
    return res.json({ success: true, studyPlan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update study plan.' });
  }
});

// -------------------------------------------------------------
// QUIZ ATTEMPTS & DYNAMIC WEAK TOPIC CALCULATION
// -------------------------------------------------------------
router.post('/quizzes/attempt', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { topic, subject, difficulty, score, total, answers } = req.body;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

    const attempts = db.getUserCollection<any[]>(userId, 'quiz_attempts', []);
    const newAttempt = {
      id: `qa_${Date.now()}`,
      topic,
      subject,
      difficulty,
      score,
      total,
      accuracy,
      answers,
      date: new Date().toISOString()
    };
    attempts.unshift(newAttempt);
    db.saveUserCollection(userId, 'quiz_attempts', attempts);

    // Update topic mastery & weak topics dynamically in the user's subjects
    const subjects = db.getUserCollection<any[]>(userId, 'subjects', []);
    let topicUpdated = false;

    for (const subj of subjects) {
      if (subj.units) {
        for (const unit of subj.units) {
          if (unit.topics) {
            for (const t of unit.topics) {
              if (t.name.toLowerCase() === (topic || '').toLowerCase()) {
                t.quizScore = accuracy;
                t.confidenceScore = Math.min(100, Math.round(accuracy * 0.9 + 10));
                t.status = accuracy >= 80 ? 'mastered' : accuracy >= 60 ? 'learning' : 'needs-revision';
                t.lastReviewedDaysAgo = 0;
                topicUpdated = true;
              }
            }
          }
        }
      }
    }

    if (topicUpdated) {
      db.saveUserCollection(userId, 'subjects', subjects);
    }

    // Update or append to revision radar
    const radar = db.getUserCollection<any[]>(userId, 'revision_radar', []);
    const radarItem = radar.find(r => r.topic.toLowerCase() === (topic || '').toLowerCase());
    if (radarItem) {
      radarItem.lastReviewedDaysAgo = 0;
      radarItem.retentionEstimate = accuracy;
      radarItem.status = accuracy >= 70 ? 'reviewed' : 'decaying';
      radarItem.urgency = accuracy >= 70 ? 'low' : 'high';
      db.saveUserCollection(userId, 'revision_radar', radar);
    }

    return res.status(201).json({ success: true, attempt: newAttempt, updatedMastery: accuracy });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to record quiz attempt.' });
  }
});

// -------------------------------------------------------------
// FOCUS SESSIONS & TELEMETRY
// -------------------------------------------------------------
router.post('/study-sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { durationMinutes, topic, subject, soundscape } = req.body;
    const sessions = db.getUserCollection<any[]>(userId, 'study_sessions', []);
    const newSession = {
      id: `sess_${Date.now()}`,
      durationMinutes: durationMinutes || 25,
      topic,
      subject,
      soundscape,
      createdAt: new Date().toISOString()
    };
    sessions.unshift(newSession);
    db.saveUserCollection(userId, 'study_sessions', sessions);

    // Update study hours in user profile
    const profile = db.getUserProfile(userId);
    const addedHours = Math.round(((durationMinutes || 25) / 60) * 10) / 10;
    profile.studyHours = Math.round((profile.studyHours + addedHours) * 10) / 10;
    db.saveUserProfile(userId, profile);

    return res.status(201).json({ success: true, session: newSession, profile });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to record study session.' });
  }
});

export default router;
