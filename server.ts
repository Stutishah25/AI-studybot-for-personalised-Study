import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import authRouter from './server/routes/auth.js';
import dataRouter from './server/routes/data.js';
import subjectsV2Router from './server/routes/subjectsV2.js';
import apiV2Router from './server/routes/apiV2.js';
import {
  buildNovaSystemInstruction,
  SOCRATIC_TUTOR_SYSTEM_PROMPT,
  FLASHCARD_GENERATOR_SYSTEM_PROMPT,
  DOCUMENT_PARSING_SYSTEM_PROMPT,
  ADAPTIVE_QUIZ_SYSTEM_PROMPT
} from './server/prompts.js';

dotenv.config();

// Safe filename and directory path resolution with string fallbacks
const safeFileUrl = (typeof import.meta.url === 'string' && import.meta.url) ? import.meta.url : '';
let resolvedFilename = '';
try {
  if (safeFileUrl) {
    resolvedFilename = fileURLToPath(safeFileUrl);
  }
} catch {
  resolvedFilename = '';
}
const __filename = resolvedFilename || (process.argv && process.argv[1] ? String(process.argv[1]) : '');
const __dirname = __filename ? path.dirname(__filename) : (typeof process.cwd === 'function' ? process.cwd() : '.');

// Ensure process.env.PORT defaults to 10000 if undefined
if (!process.env.PORT) {
  process.env.PORT = '10000';
}
const argPortIndex = process.argv ? process.argv.indexOf('--port') : -1;
const cliPort = argPortIndex !== -1 && process.argv[argPortIndex + 1] ? process.argv[argPortIndex + 1] : undefined;
const PORT = parseInt(cliPort || process.env.PORT || '10000', 10) || 10000;

// Safe base, data storage, and client distribution paths with string fallbacks
const baseDir = (typeof __dirname === 'string' && __dirname) || (typeof process.cwd === 'function' && process.cwd()) || '.';
export const STORAGE_DATA_DIR = path.resolve(baseDir, 'data') || path.join(__dirname, '../data') || './data';
export const STATIC_DIST_DIR = path.resolve(baseDir, 'dist') || path.join(__dirname, '../dist') || './dist';

const app = express();

app.use(express.json({ limit: '10mb' }));

// Mount Auth, User Data, and V2 Universal Routers
app.use('/api/v2', apiV2Router);
app.use('/api/auth', authRouter);
app.use('/api/user', dataRouter);
app.use('/api/v2/subjects', subjectsV2Router);

// Lazy initialize GoogleGenAI client with safe environment variable reading
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  res.json({
    status: 'ok',
    aiConfigured: Boolean(apiKey),
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// 1. AI Study Assistant Chat (Socratic Tutor)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, profile, subject, topic, action } = req.body;
    const ai = getAIClient();

    const studentCtx = {
      name: profile?.name,
      academicLevel: profile?.academicLevel || profile?.yearSemester || 'Undergrad',
      stream: profile?.stream || (profile?.degree?.includes('Computer') ? 'Computer Science' : 'General'),
      learningStyle: profile?.preferredLearningStyle || 'visual & conceptual',
      studyDifficulties: profile?.studyDifficulties || [],
      subject: subject || 'General Studies',
      topic: topic || 'Core Concepts'
    };

    const systemInstruction = `${buildNovaSystemInstruction(studentCtx)}

SOCRATIC TUTOR INSTRUCTIONS:
${SOCRATIC_TUTOR_SYSTEM_PROMPT}`;

    if (ai) {
      const prompt = `Student Message: "${message}"
Action request (if any): "${action || 'Standard Socratic tutoring'}"
Context: Subject "${subject || 'General'}", Topic "${topic || 'Core'}"

Respond in a structured JSON object with this shape:
{
  "content": "Comprehensive, encouraging response text with clean markdown formatting. If assisting with a problem, use Socratic guidance and provide the initial nudge without dumping full final answers.",
  "analogy": "A short, brilliant real-world analogy explaining the core idea calibrated to their grade level",
  "coreIdea": "1-2 sentence crystal-clear takeaway",
  "example": "A concrete technical or real-world example with code, diagrams or steps if applicable",
  "commonMistakes": ["Mistake 1 that students lose marks on", "Mistake 2"],
  "memoryShortcut": "A catchy mnemonic, acronym, or mental hook to retain this topic",
  "miniQuiz": {
    "question": "A quick Socratic concept-check question to test understanding",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Why this option is correct"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        return res.json({
          success: true,
          data: {
            content: responseText,
            coreIdea: `Key takeaway for ${topic || 'this topic'}`,
            analogy: 'Imagine a physical library catalog organized by exact hash buckets.',
            commonMistakes: ['Confusing average case with worst case time complexity.'],
            memoryShortcut: 'Remember the 3 R’s: Read, Restructure, Recall.'
          }
        });
      }
    }

    // Dynamic contextual fallback
    const targetTopic = topic || message || 'Core Concept';
    const targetSubject = subject || 'your coursework';
    return res.json({
      success: true,
      data: {
        content: `### Understanding ${targetTopic}

When approaching **${targetTopic}** in ${targetSubject}, the fundamental goal is breaking down the core principles and applying them systematically.

#### 1. Core Intuition
Start by identifying the main inputs, governing rules, and standard outcomes associated with this topic.

#### 2. Key Operational Principles
- **Axiomatic Definition**: Understand the primary framework and definitions before jumping to edge cases.
- **Systematic Transformation**: Note how conditions evolve step-by-step during problem solving.
- **Boundary Verification**: Always test boundary inputs or extreme values.

#### 3. Socratic Prompt
What is the first step you would take when analyzing a problem involving ${targetTopic}?`,
        analogy: `Think of ${targetTopic} as a specialized lens: it clarifies complex interactions by isolating the primary governing rules.`,
        coreIdea: `Mastering ${targetTopic} relies on understanding the relationship between fundamental definitions and applied scenarios in ${targetSubject}.`,
        example: `Consider a scenario where ${targetTopic} is applied directly to solve a core problem in ${targetSubject}.`,
        commonMistakes: [
          'Skipping foundational definitions before analyzing multi-step scenarios',
          'Overlooking boundary constraints and edge cases'
        ],
        memoryShortcut: 'Isolate the core rule, verify the inputs, then execute step-by-step.',
        miniQuiz: {
          question: `What is the most effective initial approach when solving problems on ${targetTopic}?`,
          options: ['Identify core definitions and constraints', 'Guess without checking inputs', 'Ignore boundary conditions', 'Skip intermediate steps'],
          correctIndex: 0,
          explanation: `In ${targetSubject}, clarifying definitions and constraints first prevents errors.`
        }
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({ error: error.message || 'AI generation error' });
  }
});

// 2. Smart Notes Generator
app.post('/api/ai/notes', async (req: Request, res: Response) => {
  try {
    const { topic, subject, noteType, length, rawContent, profile } = req.body;
    const ai = getAIClient();

    const noteTypeLabels: Record<string, string> = {
      quick: 'Quick Revision Notes',
      detailed: 'Detailed Academic Notes',
      exam: 'High-Yield Exam Notes',
      cheatsheet: 'One-Page Cheat Sheet',
      definitions: 'Core Definitions & Formulas',
      formulas: 'Mathematical & Complexity Formulas',
      mistakes: 'Common Exam Pitfalls & Mistakes'
    };

    const requestedType = noteTypeLabels[noteType] || 'Revision Notes';

    if (ai) {
      const prompt = `Generate ${requestedType} for the topic "${topic}" in subject "${subject}".
Note length mode: "${length || 'quick'}".
Source material / context provided: "${rawContent ? rawContent.substring(0, 1500) : 'Standard college syllabus context'}".
Student's learning style: ${profile?.preferredLearningStyle || 'conceptual & visual'}.

Generate clear, beautifully formatted Markdown notes. Use headings, bullet points, callout boxes, code snippets or tables where helpful.
Also return a list of 3-5 high-yield tags.

Return JSON:
{
  "title": "Clean, memorable title for these notes",
  "markdown": "Complete Markdown note content",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "summary": "1-sentence executive summary of the note"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    }

    // Universally adaptive fallback notes
    const noteSubject = subject || 'General Studies';
    const noteTopic = topic || 'Core Topic';
    return res.json({
      success: true,
      data: {
        title: `${noteTopic} — ${requestedType}`,
        markdown: `# ${noteTopic} — High-Yield Overview

### 1. Fundamental Principle
In ${noteSubject}, **${noteTopic}** represents a foundational area of study critical for mastering core concepts and applied synthesis.

### 2. Essential Definitions & Key Mechanisms
- **Core Definition**: Fundamental laws and structural rules governing ${noteTopic}.
- **Primary Mechanism**: Step-by-step process used to evaluate or solve problems.
- **Application Context**: Where and how this concept appears in practical exercises.

### 3. Key Properties & Rules
1. **First Principle**: Always verify the problem's given parameters and baseline conditions.
2. **Methodological Consistency**: Apply standard analytical procedures systematically.
3. **Synthesis**: Relate outcomes back to the overarching objectives in ${noteSubject}.

### 4. Common Exam Pitfalls
> ⚠️ **Warning**: Watch out for subtle counter-examples or boundary conditions frequently tested on exams.

### 5. Quick Recall Check
- State the primary definition of ${noteTopic} in your own words.
- What key constraint or condition must hold true when applying this concept?`,
        tags: [noteSubject, noteTopic, 'Study Notes', 'High-Yield'],
        summary: `Structured ${requestedType} summarizing key principles, mechanisms, and exam traps for ${noteTopic}.`
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/notes:', error);
    res.status(500).json({ error: error.message || 'Notes generation error' });
  }
});

// 2b. High-Yield Flashcard Generator (Active Recall Engine)
app.post('/api/ai/flashcards', async (req: Request, res: Response) => {
  try {
    const { topic, subject, rawContent, count, profile } = req.body;
    const ai = getAIClient();
    const targetCount = Number(count) || 6;

    const studentCtx = {
      name: profile?.name,
      academicLevel: profile?.academicLevel || profile?.yearSemester || 'Undergrad',
      stream: profile?.stream || (profile?.degree?.includes('Computer') ? 'Computer Science' : 'General'),
      learningStyle: profile?.preferredLearningStyle || 'visual & conceptual',
      subject: subject || 'General Studies',
      topic: topic || 'Core Concepts'
    };

    if (ai) {
      const prompt = `Generate ${targetCount} high-yield, scientifically sound flashcards for "${topic}" in subject "${subject}".
Source Material / Notes (if any): "${rawContent ? rawContent.substring(0, 2000) : 'Standard academic curriculum'}"

Follow FLASHCARD PRINCIPLES:
${FLASHCARD_GENERATOR_SYSTEM_PROMPT}

Academic Context: ${studentCtx.academicLevel} in ${studentCtx.stream}.

Return JSON:
{
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Clear, precise question, mechanism test, or prompt",
      "back": "Definitive, high-clarity explanation or answer",
      "hint": "Optional mental trigger or initial nudge",
      "mnemonic": "Catchy acronym or memory hook",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: buildNovaSystemInstruction(studentCtx),
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed.flashcards || [] });
    }

    // Dynamic contextual fallback flashcards
    const cardTopic = topic || 'Key Concept';
    const cardSubj = subject || 'Coursework';
    return res.json({
      success: true,
      data: [
        {
          id: 'fc-1',
          front: `What is the core definition of ${cardTopic} in ${cardSubj}?`,
          back: `The foundational principles and essential properties that characterize ${cardTopic}.`,
          hint: `Recall the primary definitions and scope in ${cardSubj}.`,
          mnemonic: 'Define, Analyze, Apply',
          difficulty: 'easy'
        },
        {
          id: 'fc-2',
          front: `How does ${cardTopic} behave under boundary or edge-case conditions?`,
          back: `Boundary constraints must be explicitly tested to prevent unexpected degradation or invalid state.`,
          hint: 'Think about extreme or limiting inputs.',
          mnemonic: 'Check boundaries first',
          difficulty: 'medium'
        },
        {
          id: 'fc-3',
          front: `What common misconception should you avoid when analyzing ${cardTopic}?`,
          back: `Assuming standard conditions apply universally without verifying prerequisites and assumptions.`,
          hint: 'Beware false assumptions.',
          mnemonic: 'Validate premises',
          difficulty: 'hard'
        }
      ]
    });
  } catch (error: any) {
    console.error('Error in /api/ai/flashcards:', error);
    res.status(500).json({ error: error.message || 'Flashcard generation error' });
  }
});

// 2c. Document & Notes Parsing Engine
app.post('/api/ai/parse-document', async (req: Request, res: Response) => {
  try {
    const { documentText, fileName, subject, profile } = req.body;
    if (!documentText) {
      return res.status(400).json({ error: 'Document text is required.' });
    }

    const ai = getAIClient();
    const studentCtx = {
      name: profile?.name,
      academicLevel: profile?.academicLevel || profile?.yearSemester || 'Undergrad',
      stream: profile?.stream || 'General',
      subject: subject || 'General Studies'
    };

    if (ai) {
      const prompt = `Parse and extract high-yield academic structure from this document ("${fileName || 'Uploaded Notes'}"):
Document Content:
"""${documentText.substring(0, 5000)}"""

DOCUMENT PARSING DIRECTIVES:
${DOCUMENT_PARSING_SYSTEM_PROMPT}

Student Academic Level: ${studentCtx.academicLevel}, Stream: ${studentCtx.stream}.

Return JSON:
{
  "title": "Clean, descriptive academic title",
  "executiveSummary": "1-2 sentence core thesis or executive summary",
  "keyConcepts": [
    {
      "name": "Concept name",
      "definition": "Clear, precise definition",
      "examRelevance": "Why examiners focus on this",
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "suggestedTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "studyQuestions": [
    "Thought-provoking Socratic question 1",
    "Thought-provoking Socratic question 2"
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: buildNovaSystemInstruction(studentCtx),
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    }

    // Fallback document parsing
    return res.json({
      success: true,
      data: {
        title: `${fileName || 'Study Material'} — Parsed Overview`,
        executiveSummary: `Structured extraction covering fundamental definitions, core theoretical invariants, and exam-critical nuances.`,
        keyConcepts: [
          {
            name: 'Primary Invariant',
            definition: 'Guaranteed property preserved across all valid states and operations.',
            examRelevance: 'Common source of boundary-case questions on exams.',
            difficulty: 'medium'
          },
          {
            name: 'Operational Complexity',
            definition: 'Upper bound on runtime and auxiliary memory consumption.',
            examRelevance: 'Examiners test worst-case vs average-case distinctions.',
            difficulty: 'easy'
          }
        ],
        suggestedTopics: ['Core Foundations', 'Mechanics & Proofs', 'Applied Problem Solving'],
        studyQuestions: [
          'What happens to the system state if boundary constraints are violated?',
          'Which trade-offs make this approach preferable to simpler alternatives?'
        ]
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/parse-document:', error);
    res.status(500).json({ error: error.message || 'Document parsing error' });
  }
});

// 3. Interactive Mind Map Generator
app.post('/api/ai/mindmap', async (req: Request, res: Response) => {
  try {
    const { topic, subject } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `Create a hierarchical mind map structure for the topic "${topic}" in subject "${subject || 'Computer Science'}".
Include the root node, 3 to 4 major branch categories, and each branch should have 2 to 3 sub-nodes.
Each node should have:
- "id": string
- "label": concise title (2-4 words)
- "description": 1-2 sentence clear definition
- "keyPoints": array of 2-3 specific bullet points
- "relatedConcepts": array of 2 related topics
- "children": optional array of child nodes

Return JSON:
{
  "root": { ...hierarchical node object... }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed.root || parsed });
    }

    // Dynamically adaptive fallback mind map
    const mapTopic = topic || 'Subject Concepts';
    const mapSubj = subject || 'Coursework';
    return res.json({
      success: true,
      data: {
        id: `mm-${Date.now()}`,
        label: mapTopic,
        description: `Comprehensive hierarchical breakdown of ${mapTopic} in ${mapSubj}.`,
        color: '#818cf8',
        children: [
          {
            id: 'node-core-1',
            label: 'Foundations & Definitions',
            description: `Core principles and baseline terminology of ${mapTopic}.`,
            color: '#38bdf8',
            keyPoints: ['Basic definitions', 'Fundamental taxonomy', 'Scope and assumptions'],
            relatedConcepts: ['Prerequisites', 'Terminology'],
            children: [
              {
                id: 'sub-1a',
                label: 'Core Definitions',
                description: 'Essential terminology and properties.',
                keyPoints: ['Standard definitions', 'Boundary conditions']
              },
              {
                id: 'sub-1b',
                label: 'Underlying Invariants',
                description: 'Constants and invariants that must hold.',
                keyPoints: ['Structural invariants', 'Theoretical guarantees']
              }
            ]
          },
          {
            id: 'node-core-2',
            label: 'Mechanisms & Methodology',
            description: `Operational rules and problem-solving methods for ${mapTopic}.`,
            color: '#a78bfa',
            keyPoints: ['Analytical frameworks', 'Step-by-step procedures', 'Efficiency and trade-offs'],
            relatedConcepts: ['Analysis', 'Execution'],
            children: [
              {
                id: 'sub-2a',
                label: 'Workflows & Procedures',
                description: 'Systematic approach to problem solving.',
                keyPoints: ['Standard sequence', 'Verification checks']
              },
              {
                id: 'sub-2b',
                label: 'Edge Cases & Exceptions',
                description: 'Non-standard conditions and limits.',
                keyPoints: ['Extreme parameters', 'Alternative pathways']
              }
            ]
          },
          {
            id: 'node-core-3',
            label: 'Synthesis & Exam Edge Cases',
            description: `Real-world applications and common exam pitfalls for ${mapTopic}.`,
            color: '#34d399',
            keyPoints: ['Common student misconceptions', 'Cross-topic synthesis', 'Exam question patterns'],
            relatedConcepts: ['Practice Problems', 'Case Studies'],
            children: [
              {
                id: 'sub-3a',
                label: 'Common Traps',
                description: 'Frequent errors tested on exams.',
                keyPoints: ['Premise verification', 'Subtle pitfalls']
              },
              {
                id: 'sub-3b',
                label: 'Applied Synthesis',
                description: 'Connecting theory to complex exercises.',
                keyPoints: ['Case studies', 'Comprehensive evaluation']
              }
            ]
          }
        ]
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/mindmap:', error);
    res.status(500).json({ error: error.message || 'Mind map generation error' });
  }
});

// 4. Memory Shortcut / Mnemonic Engine
app.post('/api/ai/shortcut', async (req: Request, res: Response) => {
  try {
    const { topic, subject, customIdea } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `Create a memorable, sticky memory shortcut for college students studying "${topic}" in "${subject || 'Computer Science'}".
${customIdea ? `Incorporate the student's custom idea: "${customIdea}"` : ''}

Generate:
1. "title": Catchy title
2. "mnemonic": An acronym or memorable phrase where each word starts with a key letter or concept
3. "story": A vivid, humorous, or bizarre sensory story that makes it unforgettable
4. "visualAssociation": A concrete physical mental picture
5. "whyItWorks": Scientific reason why this memory trick anchors in long-term memory
6. "tags": Array of 3 tags

Return JSON matching these keys.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    }

    // Fallback shortcut
    return res.json({
      success: true,
      data: {
        title: `Memory Hook for ${topic || 'Key Concept'}`,
        mnemonic: 'PASS: Plan, Align, Solve, Stabilize',
        story: `Picture an astronaut on a spacewalk who must PASS the cosmic gate: first they Plan the coordinates, Align their solar thrusters, Solve the docking trajectory, and Stabilize the lock!`,
        visualAssociation: 'A glowing golden padlock that snaps shut only when 4 geometric keys align in exact order.',
        whyItWorks: 'Relies on the von Restorff isolation effect and active spatial sequencing to eliminate hesitation under exam pressure.',
        tags: [subject || 'CS', topic || 'Recall', 'Mnemonic']
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/shortcut:', error);
    res.status(500).json({ error: error.message || 'Shortcut generation error' });
  }
});

// 5. Active Recall Question Generator
app.post('/api/ai/recall-question', async (req: Request, res: Response) => {
  try {
    const { topic, subject, questionType } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `Generate an active recall question for college student on topic: "${topic}" in subject "${subject}".
Question type requested: "${questionType || 'short-answer'}" (can be mcq, true-false, fill-blank, short-answer, explain, or scenario).

Do NOT give the answer right away in the prompt. Provide:
1. "question": The question prompt
2. "questionType": "${questionType || 'short-answer'}"
3. "options": array of 4 strings (if mcq), else empty array
4. "hint": A progressive hint that points in the right direction without revealing the answer
5. "correctAnswer": The definitive correct answer or expected model answer
6. "explanation": Comprehensive explanation of why this answer is correct
7. "keyConcepts": 3 key phrases or keywords the student's answer must include

Return JSON:
{
  "question": "...",
  "questionType": "...",
  "options": ["..."],
  "hint": "...",
  "correctAnswer": "...",
  "explanation": "...",
  "keyConcepts": ["..."]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    }

    // Fallback recall question
    return res.json({
      success: true,
      data: {
        question: `In ${topic || 'this structure'}, how does an LR (Left-Right) rotation differ from a simple RR (Right-Right) rotation in resolving tree imbalance?`,
        questionType: questionType || 'short-answer',
        options: questionType === 'mcq' ? [
          'LR requires two rotations (left rotate child, then right rotate parent); RR requires only one right rotation',
          'LR requires two rotations (left rotate child, then right rotate parent); RR requires only one left rotation',
          'LR is performed at the root; RR is performed at leaf nodes',
          'There is no difference in steps, only in node values'
        ] : [],
        hint: 'Think about the shape of the imbalance: is it in a single straight line, or does it have an "elbow" dog-leg crook that needs straightening first?',
        correctAnswer: 'An LR imbalance has a bent shape (left child, right grandchild), so it requires two single rotations: first a Left rotation on the left child to convert it to an LL line, followed by a Right rotation on the unbalanced node. An RR imbalance is already in a straight line to the right, requiring only one Left rotation.',
        explanation: 'Single rotations can only balance straight-line insertions (LL and RR). Any zig-zag or elbow formation (LR and RL) must first be straightened into an LL or RR case before the final rotation can restore the AVL balance factor invariant.',
        keyConcepts: ['Double rotation', 'Straighten zig-zag into straight line', 'Left child rotate left then parent rotate right']
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/recall-question:', error);
    res.status(500).json({ error: error.message || 'Recall question generation error' });
  }
});

// 6. Answer Evaluator
app.post('/api/ai/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const { question, studentAnswer, expectedAnswer, keyConcepts, topic } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `Evaluate the college student's answer for the following question on "${topic || 'Concept'}":
Question: "${question}"
Expected Answer / Rubric: "${expectedAnswer}"
Required Key Concepts: ${(keyConcepts || []).join(', ')}
Student's Answer: "${studentAnswer}"

Evaluate fairly and provide educational feedback:
1. "isCorrect": boolean (true if essentially correct or mostly correct >= 70%)
2. "score": number between 0 and 100
3. "feedback": 2-3 encouraging, constructive sentences explaining what was good
4. "whatMissed": Clear bullet points or explanation of what critical nuances or terminology the student missed
5. "recommendedRevision": Specific advice on what to review in the next 15 minutes
6. "weakTopicUpdate": Summary statement of how mastery score should be calibrated

Return JSON with those exact keys.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    }

    // Heuristic fallback evaluation
    const studentWords = (studentAnswer || '').toLowerCase();
    const hasLength = studentWords.trim().length > 10;
    const score = hasLength ? 82 : 45;
    const isCorrect = score >= 70;

    return res.json({
      success: true,
      data: {
        isCorrect,
        score,
        feedback: isCorrect
          ? 'Great intuition! You demonstrated a clear grasp of the primary structural transformation.'
          : 'You have the right intuition about rotational balance, but missed key technical specifics.',
        whatMissed: isCorrect
          ? 'To get full marks in an exam, be sure to explicitly state the time complexity ($O(1)$ pointer adjustments) and mention node height recalculation.'
          : 'Make sure to explicitly mention that an LR case requires two steps: first rotating the child to form a straight line, and then rotating the grandparent.',
        recommendedRevision: `Review the visual rotation cheat sheet in Notes Studio for 5 minutes to solidify the double-step pattern.`,
        weakTopicUpdate: isCorrect ? '+5% confidence recorded for this topic' : 'Topic flagged for spaced repetition review'
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/evaluate-answer:', error);
    res.status(500).json({ error: error.message || 'Answer evaluation error' });
  }
});

// 7. Adaptive Smart Quiz Generator
app.post('/api/ai/adaptive-quiz', async (req: Request, res: Response) => {
  try {
    const { subject, topic, difficulty, questionCount } = req.body;
    const ai = getAIClient();
    const count = Number(questionCount) || 4;

    if (ai) {
      const prompt = `Generate an adaptive quiz of ${count} high-quality questions for college students on topic "${topic}" in subject "${subject}".
Target Difficulty: "${difficulty || 'Medium'}".

For each question return:
- "id": unique string
- "question": clear question stem
- "options": array of 4 clear options
- "correctIndex": index 0-3 of the correct answer
- "explanation": why the correct answer is right and why distractors are wrong
- "difficulty": "${difficulty || 'Medium'}"
- "topic": "${topic}"

Return JSON:
{
  "questions": [ ... ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed.questions || [] });
    }

    // Fallback adaptive questions generated dynamically for the requested topic
    const targetTopic = topic || 'Core Principles';
    const targetSubject = subject || 'Coursework';
    return res.json({
      success: true,
      data: [
        {
          id: 'q1',
          question: `What is the foundational definition and primary role of ${targetTopic} in ${targetSubject}?`,
          options: [
            `It defines the core governing invariants and relationships governing the system`,
            `It serves only as a temporary decorative placeholder`,
            `It reverses all established principles without verification`,
            `It has no relation to the syllabus or practical applications`
          ],
          correctIndex: 0,
          explanation: `In ${targetSubject}, understanding ${targetTopic} provides the conceptual framework necessary to analyze and predict behavior accurately.`,
          difficulty: difficulty || 'Medium',
          topic: targetTopic
        },
        {
          id: 'q2',
          question: `How should boundary conditions or limiting cases be approached when analyzing ${targetTopic}?`,
          options: [
            `Ignore edge cases and assume nominal values always hold`,
            `Systematically test minimum, maximum, and extreme parameters against governing constraints`,
            `Skip verification to save computation time`,
            `Assume boundaries are undefined in all scenarios`
          ],
          correctIndex: 1,
          explanation: `Robust analysis of ${targetTopic} requires evaluating boundary conditions to verify stability and prevent unexpected failures.`,
          difficulty: difficulty || 'Medium',
          topic: targetTopic
        },
        {
          id: 'q3',
          question: `What is a common pitfall students encounter when answering exam questions on ${targetTopic}?`,
          options: [
            `Overlooking prerequisite assumptions before applying standard formulas or theorems`,
            `Reading the problem statement carefully`,
            `Verifying unit consistency and dimensions`,
            `Applying step-by-step reasoning`
          ],
          correctIndex: 0,
          explanation: `A frequent trap in ${targetSubject} is applying a general rule to ${targetTopic} without validating that all prerequisite criteria are met.`,
          difficulty: difficulty || 'Hard',
          topic: targetTopic
        },
        {
          id: 'q4',
          question: `When synthesizing a solution involving ${targetTopic}, what is the recommended first step?`,
          options: [
            `Jump directly to arbitrary calculations without defining variables`,
            `Clarify known parameters, constraints, and the governing model`,
            `Discard the given problem constraints`,
            `Assume the answer is trivial`
          ],
          correctIndex: 1,
          explanation: `Structuring the known parameters and constraints first provides clarity and prevents systematic errors when working with ${targetTopic}.`,
          difficulty: difficulty || 'Easy',
          topic: targetTopic
        }
      ]
    });
  } catch (error: any) {
    console.error('Error in /api/ai/adaptive-quiz:', error);
    res.status(500).json({ error: error.message || 'Quiz generation error' });
  }
});

// 8. Exam Mode Plan Generator
app.post('/api/ai/exam-plan', async (req: Request, res: Response) => {
  try {
    const { subject, examDate, daysLeft, currentConfidence, syllabus } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `Create an adaptive exam revision plan for a college student:
Subject: "${subject}"
Exam in: ${daysLeft} days (Date: ${examDate})
Current Confidence: ${currentConfidence}%
Syllabus / Focus: "${syllabus || 'Standard college syllabus'}"

Return JSON:
{
  "priorityTopics": [
    { "topic": "Name", "priority": "High"|"Medium"|"Low", "weightage": "25% of Marks", "confidence": 50 }
  ],
  "revisionSchedule": [
    { "dayNumber": 1, "dateStr": "Day 1", "tasks": ["Task 1", "Task 2"] }
  ],
  "dailyTargets": ["Target 1", "Target 2", "Target 3"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    }

    // Fallback exam plan
    return res.json({
      success: true,
      data: {
        priorityTopics: [
          { topic: 'Core Invariants & Edge Cases', priority: 'High', weightage: '30% of Marks', confidence: currentConfidence || 50 },
          { topic: 'High-Frequency Exam Proofs & Algorithms', priority: 'High', weightage: '28% of Marks', confidence: 55 },
          { topic: 'Complexity Trade-offs & Space Analysis', priority: 'Medium', weightage: '22% of Marks', confidence: 65 },
          { topic: 'Definitions & Historical Context', priority: 'Low', weightage: '20% of Marks', confidence: 85 }
        ],
        revisionSchedule: [
          { dayNumber: 1, dateStr: 'Today', tasks: ['Active Recall test on weakest unit', 'Formulas cheat sheet speed review (20 min)'] },
          { dayNumber: 2, dateStr: 'Tomorrow', tasks: ['Solve 3 previous year mid-term questions', 'Revisit mind map key branches'] },
          { dayNumber: 3, dateStr: 'Day 3', tasks: ['Full 30-min timed adaptive quiz', 'Remediate any errors with NOVA AI'] }
        ],
        dailyTargets: [
          'Master 2 high-yield exam algorithms',
          'Complete 1 timed active recall drill',
          'Review formula cheat sheet before bedtime'
        ]
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/exam-plan:', error);
    res.status(500).json({ error: error.message || 'Exam plan generation error' });
  }
});

// 9. Global AI Command Bar
app.post('/api/ai/command', async (req: Request, res: Response) => {
  try {
    const { query, profile } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `A college student typed this command into NOVA AI Command Bar: "${query}"
Classify the intent and generate the optimal response.
Intent types: "explain" | "mindmap" | "notes" | "quiz" | "shortcut" | "plan" | "recall"

Return JSON:
{
  "intent": "explain" | "mindmap" | "notes" | "quiz" | "shortcut" | "plan" | "recall",
  "suggestedRoute": "home" | "subjects" | "tutor" | "notes" | "mindmaps" | "memory-lab" | "recall" | "quiz" | "exam-mode" | "revision-radar",
  "topic": "Extracted topic",
  "responseSummary": "A concise, sharp 1-2 paragraph direct answer or recommendation for their request."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed });
    }

    // Fallback command routing
    const lower = (query || '').toLowerCase();
    let intent = 'explain';
    let suggestedRoute = 'tutor';

    if (lower.includes('mind map') || lower.includes('map')) {
      intent = 'mindmap';
      suggestedRoute = 'mindmaps';
    } else if (lower.includes('note') || lower.includes('cheat sheet') || lower.includes('summarize')) {
      intent = 'notes';
      suggestedRoute = 'notes';
    } else if (lower.includes('quiz') || lower.includes('test')) {
      intent = 'quiz';
      suggestedRoute = 'quiz';
    } else if (lower.includes('mnemonic') || lower.includes('shortcut') || lower.includes('remember')) {
      intent = 'shortcut';
      suggestedRoute = 'memory-lab';
    } else if (lower.includes('plan') || lower.includes('exam') || lower.includes('schedule')) {
      intent = 'plan';
      suggestedRoute = 'exam-mode';
    } else if (lower.includes('recall')) {
      intent = 'recall';
      suggestedRoute = 'recall';
    }

    return res.json({
      success: true,
      data: {
        intent,
        suggestedRoute,
        topic: query,
        responseSummary: `NOVA has analyzed your request: "${query}". We've prepared targeted ${intent} resources matched to your study profile.`
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/command:', error);
    res.status(500).json({ error: error.message || 'Command error' });
  }
});

// Vite middleware setup
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Safe string fallbacks for client distribution directory and entry point
    const distPath = STATIC_DIST_DIR || path.join(__dirname, '../dist') || path.resolve(baseDir, 'dist') || './dist';
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      const indexPath = path.resolve(distPath, 'index.html') || path.join(distPath, 'index.html') || './dist/index.html';
      res.sendFile(indexPath);
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`NOVA Study Companion server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
