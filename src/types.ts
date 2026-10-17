export type AcademicLevel = 
  | 'Middle School' 
  | 'High School' 
  | 'AP/IB' 
  | 'Undergrad' 
  | 'Postgrad';

export type AcademicStream = 
  | 'General' 
  | 'Computer Science' 
  | 'Pre-Med' 
  | 'Business/Econ' 
  | 'Humanities' 
  | 'Law';

export type LearningStyle = 
  | 'visual'
  | 'conceptual'
  | 'example-based'
  | 'short'
  | 'detailed'
  | 'practice-heavy'
  | 'combination';

export type StudyDifficulty =
  | 'understanding'
  | 'remembering'
  | 'starting'
  | 'focusing'
  | 'problems'
  | 'revision'
  | 'multiple-subjects'
  | 'understanding-concepts'
  | 'remembering-info'
  | 'starting-to-study'
  | 'staying-focused'
  | 'solving-problems'
  | 'revising-before-exams'
  | 'managing-multiple-subjects';

export interface StudentProfile {
  name: string;
  degree: string;
  yearSemester: string;
  academicLevel?: AcademicLevel;
  stream?: AcademicStream;
  subjects: string[];
  syllabus: string;
  upcomingExams: Array<{ subject: string; date: string; daysLeft: number }>;
  dailyStudyTime: string;
  preferredLearningStyle: LearningStyle;
  studyDifficulties: StudyDifficulty[];
  onboarded: boolean;
  streak?: number;
  studyHours?: number;
}

export interface Topic {
  id: string;
  name: string;
  unitId?: string;
  subjectId?: string;
  status: 'not-started' | 'learning' | 'needs-revision' | 'mastered';
  quizScore: number; // 0-100
  confidenceScore: number; // 0-100
  lastReviewedDaysAgo: number;
  difficulty: 'easy' | 'medium' | 'hard';
  summary?: string;
  subtopics?: string[];
  notesCount?: number;
}

export interface SubjectUnit {
  id: string;
  unitNumber: number;
  title: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  title?: string;
  name: string;
  courseCode?: string;
  code: string;
  targetExamDate?: string;
  description: string;
  progress: number;
  color: string;
  accentColor: string;
  topics?: Topic[];
  units: SubjectUnit[];
  created_at?: string;
}

export interface StudyPlanItem {
  id: string;
  time: string;
  title: string;
  durationMinutes: number;
  type: 'review' | 'practice' | 'quiz' | 'recall' | 'concept';
  topic: string;
  subject: string;
  completed: boolean;
}

export type NoteType =
  | 'quick-revision'
  | 'detailed'
  | 'exam-notes'
  | 'one-page-cheat-sheet'
  | 'definitions'
  | 'formulas'
  | 'examples'
  | 'mistakes'
  | 'quick'
  | 'exam'
  | 'cheatsheet';

export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  type?: string;
  noteType?: NoteType;
  length?: 'ultra-short' | 'quick' | 'detailed';
  summary?: string;
  content: string;
  createdAt: string;
  tags?: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  details?: string;
  keyPoints?: string[];
  relatedConcepts?: string[];
  children?: MindMapNode[];
  color?: string;
}

export interface MemoryShortcutItem {
  id: string;
  concept?: string;
  topic?: string;
  subject: string;
  title?: string;
  mnemonic: string;
  story?: string;
  visualAssociation?: string;
  whyItWorks?: string;
  isCustom?: boolean;
  tags?: string[];
  createdAt: string;
}

export type QuestionType =
  | 'mcq'
  | 'true-false'
  | 'fill-blank'
  | 'short-answer'
  | 'explain'
  | 'scenario'
  | 'explain-concept';

export interface RecallQuestionPayload {
  id: string;
  topic: string;
  subject?: string;
  questionType: QuestionType | string;
  prompt: string;
  options?: string[];
  hints: string[];
  idealAnswer: string;
  keyPointsExpected: string[];
}

export interface EvaluationResponsePayload {
  score: number; // 0-100
  isAccurate: boolean;
  explanation: string;
  strengths: string[];
  gaps: string[];
  recommendedAction: string;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty?: string;
  topic?: string;
}

export interface ExamCountdown {
  id?: string;
  subject?: string;
  examDate?: string;
  daysLeft?: number;
  confidence?: number;
  upcomingExams?: Array<{ subject: string; date: string; daysLeft: number }>;
  priorityTopics: Array<{
    topic: string;
    priority: 'high' | 'medium' | 'low' | 'High' | 'Medium' | 'Low';
    weightage: number | string;
    confidence?: number;
  }>;
  dailySchedule?: Array<{
    day: number;
    focusArea: string;
    targetHours: number;
    tasks: string[];
  }>;
  revisionSchedule?: Array<{
    dayNumber: number;
    dateStr: string;
    tasks: string[];
  }>;
  dailyTargets?: string[];
}

export interface RevisionRadarItem {
  id: string;
  topic: string;
  subject: string;
  lastReviewedDaysAgo: number;
  retentionEstimate: number; // 0-100% based on forgetting curve
  status: 'due-now' | 'due-soon' | 'recently-reviewed';
  urgency: 'high' | 'medium' | 'low';
  reason: string;
  recommendedAction?: string;
}

export type TutorActionType =
  | 'explain-simply'
  | 'give-example'
  | 'make-notes'
  | 'create-mindmap'
  | 'give-shortcut'
  | 'test-me'
  | 'explain-like-im-10'
  | 'exam-answer'
  | 'give-practice-questions';

export interface TutorResponsePayload {
  topic: string;
  action: TutorActionType | string;
  explanation: string;
  analogy: string;
  coreIdea: string;
  example: string;
  commonMistakes: string[];
  memoryShortcut: string;
  miniQuiz: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  academicLevel?: AcademicLevel;
  stream?: AcademicStream;
  isDemo?: boolean;
  created_at?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
