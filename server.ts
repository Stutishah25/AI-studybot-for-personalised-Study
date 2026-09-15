import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
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
  res.json({
    status: 'ok',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// 1. AI Study Assistant Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, profile, subject, topic, action } = req.body;
    const ai = getAIClient();

    let systemInstruction = `You are NOVA, a personal AI study companion for college students.
Your student is ${profile?.name || 'a student'} studying ${profile?.degree || 'Engineering'}, Year/Semester: ${profile?.yearSemester || 'Year 3'}.
Learning style: ${profile?.preferredLearningStyle || 'visual & conceptual'}.
Study difficulties to address: ${(profile?.studyDifficulties || []).join(', ')}.
Current Subject: ${subject || 'General Studies'}.
Current Topic: ${topic || 'Core Concepts'}.

Guidelines:
1. Speak with calm, intelligent academic clarity. Never be generic or robotic.
2. Adapt explanations to their learning style. If 'visual', use ASCII diagrams or structured conceptual maps. If 'analogy', give relatable real-world physical analogies.
3. Keep responses high-yield, structured, and easy to memorize.
4. If the student asked for a specific action (like "Explain Simply", "Give Example", "Make Notes", "Create Mind Map", "Give Shortcut", "Test Me", "Explain Like I'm 10", "Exam Answer"), follow that mode precisely.`;

    if (ai) {
      const prompt = `Student Message: "${message}"
Action request (if any): "${action || 'Standard tutoring'}"
Respond in a structured JSON object with this shape:
{
  "content": "Comprehensive main response text with markdown formatting",
  "analogy": "A short, brilliant real-world analogy explaining the core idea",
  "coreIdea": "1-2 sentence crystal-clear takeaway",
  "example": "A concrete technical or real-world example with code or steps if applicable",
  "commonMistakes": ["Mistake 1 that students lose marks on", "Mistake 2"],
  "memoryShortcut": "A catchy mnemonic, acronym, or mental hook to retain this topic",
  "miniQuiz": {
    "question": "A quick concept-check question",
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

    // High quality contextual fallback
    return res.json({
      success: true,
      data: {
        content: `### Understanding ${topic || message}

When approaching **${topic || message}** in ${subject || 'your coursework'}, the fundamental goal is maintaining predictable invariants. 

#### 1. The Core Mechanism
Think of it like balancing a high-speed elevator cable system: if one side bears too much slack or tension, a quick pivot restores equilibrium before systemic failure occurs.

#### 2. Key Operational Principles
- **Balanced Invariant**: Keep height difference bounded to $\\le 1$.
- **Subtree Preservation**: In-order traversal ordering is strictly preserved during state changes.
- **Local vs Global Cost**: Local operations take $O(1)$, ensuring aggregate paths remain bounded by $O(\\log n)$.

#### 3. Exam Tip
Examiners frequently test the edge case where deletion triggers cascading updates up to the root. Always recalculate heights bottom-up!`,
        analogy: `Imagine a playground seesaw with an automatic counterweight: whenever one child leans too far back, a gentle hinge flips the center plank so neither child hits the ground.`,
        coreIdea: `Every operation is designed to keep tree depth at $O(\\log n)$, guaranteeing logarithmic lookup even with adversarial insertions.`,
        example: `Inserting keys [10, 20, 30] sequentially into a naive tree produces a degenerate linked list of depth 3. With self-balancing, an RR rotation pivots 20 to the root, giving depth 2.`,
        commonMistakes: [
          'Attempting a single rotation on an "elbow" shaped imbalance (LR or RL case)',
          'Forgetting to update node heights before checking grandparent balance factors',
          'Assuming deletion requires at most one rotation (unlike insertion, deletion can require $O(\\log n)$ rotations)'
        ],
        memoryShortcut: 'Straighten the elbow first, then swing the shoulder! (LR -> LL -> Balanced)',
        miniQuiz: {
          question: `What is the maximum balance factor allowed for any node in an AVL tree?`,
          options: ['0 only', '-1, 0, or +1', '-2 to +2', 'Any positive integer'],
          correctIndex: 1,
          explanation: 'AVL trees enforce that for every node, |height(left) - height(right)| <= 1, meaning balance factors must be in {-1, 0, 1}.'
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

    // Fallback notes
    return res.json({
      success: true,
      data: {
        title: `${topic || 'Concept'} — ${requestedType}`,
        markdown: `# ${topic || 'Key Concept'} — High-Yield Overview

### 1. Fundamental Principle
In ${subject || 'Computer Science'}, **${topic || 'this concept'}** represents a foundational mechanism for optimizing resource utilization, algorithmic efficiency, and memory access predictability.

### 2. Essential Definitions & Formulas
- **Core Mechanism**: Guaranteed invariant maintained across state transitions.
- **Time Complexity**: Average case $O(\\log n)$, Worst case $O(n)$ without balancing.
- **Space Complexity**: Auxiliary space $O(1)$ in-place or $O(n)$ for recursion stack.

### 3. Key Properties & Rules
1. **Rule of Preservation**: Relative ordering of elements remains strictly invariant.
2. **Boundary Conditions**: Null pointers, empty structures, and single-element bounds must be checked explicitly.
3. **Hardware Implication**: Cache locality impacts traversal speed significantly more than theoretical constant factors.

### 4. Common Exam Pitfalls
> ⚠️ **Warning**: Always verify base cases ($n=0$ and $n=1$) and confirm whether 1-based indexing or 0-based indexing is expected by the problem statement.

### 5. Quick Recall Check
- What is the primary trade-off between space and runtime in this structure?
- Which scenario causes the worst-case degradation?`,
        tags: [subject || 'CS', topic || 'Core', 'Exam Prep', 'High-Yield'],
        summary: `Structured ${requestedType} summarizing key mechanisms, invariants, and exam traps for ${topic}.`
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/notes:', error);
    res.status(500).json({ error: error.message || 'Notes generation error' });
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

    // Fallback mind map
    return res.json({
      success: true,
      data: {
        id: `mm-${Date.now()}`,
        label: topic || 'System Architecture',
        description: `Comprehensive hierarchical breakdown of ${topic || 'this subject domain'}.`,
        color: '#818cf8',
        children: [
          {
            id: 'node-core-1',
            label: 'Architectural Foundations',
            description: 'Underlying hardware and abstraction layers.',
            color: '#38bdf8',
            keyPoints: ['Layered isolation model', 'Hardware abstraction layer (HAL)', 'Privileged kernel space vs user space'],
            relatedConcepts: ['System Calls', 'Interrupt Vectors'],
            children: [
              {
                id: 'sub-1a',
                label: 'Kernel vs User Mode',
                description: 'Dual-mode CPU operation enforcing protection domains.',
                keyPoints: ['Mode bit flip on trap', 'Direct hardware access restricted']
              },
              {
                id: 'sub-1b',
                label: 'System Call Handling',
                description: 'Programmatic interface to operating services.',
                keyPoints: ['Trap instruction execution', 'Register argument passing']
              }
            ]
          },
          {
            id: 'node-core-2',
            label: 'Resource Scheduling',
            description: 'Fair and low-latency allocation of processing units.',
            color: '#a78bfa',
            keyPoints: ['Preemptive versus cooperative switching', 'Starvation avoidance and aging', 'Throughput vs latency trade-offs'],
            relatedConcepts: ['Round Robin', 'Priority Inversion'],
            children: [
              {
                id: 'sub-2a',
                label: 'State Lifecycle',
                description: 'Transition path across New, Ready, Running, Waiting, Terminated.',
                keyPoints: ['PCB tracking', 'Context switch overhead']
              },
              {
                id: 'sub-2b',
                label: 'Queue Disciplines',
                description: 'Multilevel feedback mechanisms.',
                keyPoints: ['I/O bound priority boosting', 'Time slice quantum sizing']
              }
            ]
          },
          {
            id: 'node-core-3',
            label: 'Memory & Cache Management',
            description: 'Translation of logical address spaces into physical frames.',
            color: '#34d399',
            keyPoints: ['Paging eliminates external fragmentation', 'TLB speedup factor', 'Demand paging page fault handling'],
            relatedConcepts: ['Virtual Memory', 'Thrashing'],
            children: [
              {
                id: 'sub-3a',
                label: 'Address Translation',
                description: 'Hardware MMU page table walk.',
                keyPoints: ['Multi-level page tables', 'Offset consistency']
              },
              {
                id: 'sub-3b',
                label: 'Eviction Algorithms',
                description: 'Policies for selecting victim frames.',
                keyPoints: ['LRU approximation via clock bit', 'Belady anomaly avoidance']
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

    // Fallback adaptive questions
    return res.json({
      success: true,
      data: [
        {
          id: 'q1',
          question: `What is the worst-case time complexity for searching a key in an AVL tree containing 'n' nodes?`,
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correctIndex: 1,
          explanation: 'Because AVL trees strictly maintain a height bounded by ~1.44 log2(n), the worst-case search path is strictly logarithmic O(log n).',
          difficulty: difficulty || 'Medium',
          topic: topic || 'AVL Trees'
        },
        {
          id: 'q2',
          question: `Which rotation is required when a new key is inserted into the left subtree of the right child of an unbalanced node?`,
          options: ['Left-Left (LL) Rotation', 'Right-Right (RR) Rotation', 'Right-Left (RL) Double Rotation', 'Left-Right (LR) Double Rotation'],
          correctIndex: 2,
          explanation: 'An insertion into the left subtree of a right child causes a Right-Left (RL) imbalance, requiring a right rotation on the child followed by a left rotation on the grandparent.',
          difficulty: difficulty || 'Medium',
          topic: topic || 'AVL Trees'
        },
        {
          id: 'q3',
          question: `What is the maximum number of rotations needed during an insertion in an AVL tree to restore balance?`,
          options: ['At most 1 or 2 rotations (single or double rotation)', 'O(log n) rotations', 'O(n) rotations', 'Zero rotations'],
          correctIndex: 0,
          explanation: 'A single insertion in an AVL tree requires at most one single rotation or one double rotation to restore the balance factor invariant for the entire tree.',
          difficulty: difficulty || 'Hard',
          topic: topic || 'AVL Trees'
        },
        {
          id: 'q4',
          question: `If an AVL node has a balance factor of +2, what does this indicate about its subtrees?`,
          options: [
            'The right subtree is 2 levels taller than the left subtree',
            'The left subtree is 2 levels taller than the right subtree',
            'Both subtrees have equal height',
            'The node is a leaf node'
          ],
          correctIndex: 1,
          explanation: 'Balance factor is standardly defined as Height(Left) - Height(Right). A value of +2 indicates the left subtree is two levels taller than the right subtree.',
          difficulty: difficulty || 'Easy',
          topic: topic || 'AVL Trees'
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
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NOVA Study Companion server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
