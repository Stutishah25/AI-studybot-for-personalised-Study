import { Router, Response } from 'express';
import { db, SubjectRecord, TopicRecord } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { GoogleGenAI } from '@google/genai';
import { SYLLABUS_GENERATION_PROMPT, buildNovaSystemInstruction } from '../prompts.js';

const router = Router();

// Apply authentication middleware to all v2 subject routes
router.use(requireAuth);

function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

/**
 * GET /api/v2/subjects
 * Fetch user-specific subjects with persistent multi-tenant isolation
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subjects = db.getUserSubjects(userId);
    return res.json({
      success: true,
      subjects,
      count: subjects.length
    });
  } catch (err: any) {
    console.error('Error fetching v2 subjects:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch subjects.' });
  }
});

/**
 * GET /api/v2/subjects/:id
 * Fetch single subject by id with user isolation. Returns 404 if not found.
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
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
 * POST /api/v2/subjects
 * Create custom subject + auto-generate 6-8 syllabus topics using LLM based on user stream & grade level
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = db.findUserById(userId);
    const profile = db.getUserProfile(userId);

    const {
      title,
      courseCode,
      targetExamDate,
      academicLevel: reqAcademicLevel,
      stream: reqStream,
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
    const effectiveAcademicLevel = reqAcademicLevel || user?.academicLevel || profile?.academicLevel || 'Undergrad';
    const effectiveStream = reqStream || user?.stream || profile?.stream || 'General';
    const cleanCourseCode = (courseCode && courseCode.trim())
      ? courseCode.trim().toUpperCase()
      : `${cleanTitle.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()}101`;

    const cleanExamDate = targetExamDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    let generatedTopics: TopicRecord[] = [];

    // If explicit preset topics were provided (e.g., custom user list), use them
    if (Array.isArray(presetTopics) && presetTopics.length > 0) {
      generatedTopics = presetTopics.map((pt, idx) => ({
        id: `t_${Date.now()}_${idx + 1}`,
        name: typeof pt === 'string' ? pt : pt.name || `Topic ${idx + 1}`,
        difficulty: (pt.difficulty || 'medium') as any,
        summary: pt.summary || `Core study module for ${cleanTitle}.`,
        quizScore: 0,
        confidenceScore: 30,
        status: 'needs-revision',
        lastReviewedDaysAgo: 0
      }));
    } else {
      // Auto-generate 6-8 syllabus topics using Gemini
      const ai = getAIClient();

      if (ai) {
        try {
          const systemInstruction = `${SYLLABUS_GENERATION_PROMPT}
Student context: Academic Level: ${effectiveAcademicLevel}, Stream: ${effectiveStream}.`;

          const prompt = `Generate a high-yield curriculum syllabus for:
Subject Title: "${cleanTitle}"
Course Code: "${cleanCourseCode}"
Target Academic Level: "${effectiveAcademicLevel}"
Academic Stream: "${effectiveStream}"
${customNotes ? `Additional user focus notes: "${customNotes}"` : ''}

You MUST return exactly 6 to 8 core syllabus topics in a JSON array.
Each topic object must have:
- "name": string (crisp, academic topic title)
- "difficulty": "easy" | "medium" | "hard"
- "summary": string (1-2 sentence description of key concepts & formulas/frameworks taught)
- "subtopics": array of 2-3 specific sub-modules

Return JSON format:
{
  "topics": [
    {
      "name": "...",
      "difficulty": "medium",
      "summary": "...",
      "subtopics": ["...", "..."]
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
          const rawTopics = Array.isArray(parsed.topics) ? parsed.topics : (Array.isArray(parsed) ? parsed : []);

          if (rawTopics.length >= 4) {
            generatedTopics = rawTopics.slice(0, 8).map((t: any, idx: number) => ({
              id: `t_${Date.now()}_${idx + 1}`,
              name: t.name || `Unit ${idx + 1}`,
              difficulty: (['easy', 'medium', 'hard'].includes(t.difficulty) ? t.difficulty : 'medium') as any,
              summary: t.summary || `Essential learning objectives for ${t.name || cleanTitle}.`,
              quizScore: 0,
              confidenceScore: 35,
              status: 'needs-revision',
              lastReviewedDaysAgo: 0
            }));
          }
        } catch (genErr) {
          console.error('LLM syllabus generation fallback triggered:', genErr);
        }
      }

      // Context-aware fallback if LLM was unavailable or timed out
      if (generatedTopics.length === 0) {
        const fallbackTopicSets: Record<string, string[]> = {
          'Computer Science': [
            'Foundations & Data Representations',
            'Core Control Structures & Logic',
            'Algorithms & Asymptotic Complexity',
            'Linear Data Structures & Traversal',
            'Trees, Graphs & State Space Search',
            'Memory Management & Invariant Safety',
            'System Architecture & Performance Profiling'
          ],
          'Pre-Med': [
            'Cellular Biology & Molecular Transport',
            'Enzymatic Kinetics & Metabolic Pathways',
            'Organ Systems & Homeostatic Feedback',
            'Physiological Mechanics & Regulation',
            'Pathology & Diagnostic Indicators',
            'Pharmacological Mechanisms & Receptors',
            'Clinical Case Synthesis & Problem Solving'
          ],
          'Business/Econ': [
            'Market Dynamics: Supply, Demand & Elasticity',
            'Consumer Choice & Production Optimization',
            'Macroeconomic Indicators & Monetary Policy',
            'Financial Modeling & Valuation Metrics',
            'Competitive Strategy & Game Theory',
            'Behavioral Decisions & Risk Management',
            'Global Trade Systems & Capital Flows'
          ],
          'Law': [
            'Foundations of Legal Systems & Jurisprudence',
            'Constitutional Frameworks & Separation of Powers',
            'Contract Formation, Breach & Remedies',
            'Torts, Negligence & Liability Standards',
            'Statutory Interpretation & Canons of Construction',
            'Civil & Criminal Procedure Mechanics',
            'Adversarial Analysis & Precedent Synthesis'
          ],
          'Humanities': [
            'Historical Context & Primary Text Foundations',
            'Critical Historiography & Methodological Frameworks',
            'Thematic Analysis & Textual Close-Reading',
            'Philosophical Premises & Dialectical Tension',
            'Cultural & Sociopolitical Impact',
            'Comparative Synthesis Across Epochs',
            'Scholarly Argumentation & Thesis Defense'
          ],
          'General': [
            'Core Foundations & Guiding Invariants',
            'Key Definitions, Terminology & Principles',
            'Analytical Frameworks & Methodologies',
            'Step-by-Step Problem Solving & Edge Cases',
            'Applied Case Studies & Real-World Synthesis',
            'Common Conceptual Traps & Misconceptions',
            'Comprehensive Synthesis & Exam Preparedness'
          ]
        };

        const topicsList = fallbackTopicSets[effectiveStream] || fallbackTopicSets['General'];
        generatedTopics = topicsList.map((tName, idx) => ({
          id: `t_${Date.now()}_${idx + 1}`,
          name: tName,
          difficulty: idx < 2 ? 'easy' : idx < 5 ? 'medium' : 'hard',
          summary: `High-yield curriculum module for ${tName} tailored to ${effectiveAcademicLevel} ${effectiveStream}.`,
          quizScore: 0,
          confidenceScore: 30,
          status: 'needs-revision',
          lastReviewedDaysAgo: 0
        }));
      }
    }

    // Wrap topics into structured units for backward compatibility with existing views
    const unit1Topics = generatedTopics.slice(0, Math.ceil(generatedTopics.length / 2));
    const unit2Topics = generatedTopics.slice(Math.ceil(generatedTopics.length / 2));

    const units = [
      {
        id: `u_${Date.now()}_1`,
        unitNumber: 1,
        title: `${cleanTitle} Part I: Foundations & Core Mechanics`,
        topics: unit1Topics
      },
      {
        id: `u_${Date.now()}_2`,
        unitNumber: 2,
        title: `${cleanTitle} Part II: Advanced Applications & Synthesis`,
        topics: unit2Topics
      }
    ];

    // Palette generator for stylish card aesthetics
    const palettes = [
      { color: 'cyan', accent: '#38bdf8' },
      { color: 'violet', accent: '#a78bfa' },
      { color: 'emerald', accent: '#34d399' },
      { color: 'amber', accent: '#fbbf24' },
      { color: 'rose', accent: '#fb7185' },
      { color: 'indigo', accent: '#818cf8' }
    ];
    const pickedPalette = palettes[Math.floor(Math.random() * palettes.length)];

    const newSubject = db.addSubject(userId, {
      title: cleanTitle,
      courseCode: cleanCourseCode,
      targetExamDate: cleanExamDate,
      topics: generatedTopics,
      units,
      progress: 0,
      description: description || `Auto-generated ${effectiveAcademicLevel} curriculum in ${effectiveStream} with ${generatedTopics.length} core topics.`,
      color: color || pickedPalette.color,
      accentColor: accentColor || pickedPalette.accent
    });

    const allSubjects = db.getUserSubjects(userId);

    return res.status(201).json({
      success: true,
      subject: newSubject,
      subjects: allSubjects
    });
  } catch (err: any) {
    console.error('Error in POST /api/v2/subjects:', err);
    return res.status(500).json({ error: err.message || 'Failed to create subject.' });
  }
});

/**
 * DELETE /api/v2/subjects/:id
 * Remove subject by id with user isolation
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const subjectId = req.params.id;

    const removed = db.deleteSubject(userId, subjectId);
    if (!removed) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    const updatedSubjects = db.getUserSubjects(userId);
    return res.json({
      success: true,
      message: 'Subject removed successfully.',
      subjects: updatedSubjects
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/v2/subjects/:id:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete subject.' });
  }
});

export default router;
