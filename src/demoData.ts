import {
  StudentProfile,
  Subject,
  StudyPlanItem,
  NoteItem,
  MindMapNode,
  MemoryShortcutItem,
  ExamCountdown,
  RevisionRadarItem
} from './types';

/**
 * 100% Clean Canvas Initializers
 * All sample and seed fallback data (e.g. Data Structures & Trees) have been completely removed.
 * Every subject, document, note, and study plan starts clean and empty.
 */

export const initialStudentProfile: StudentProfile = {
  name: 'Student',
  degree: '',
  yearSemester: '',
  subjects: [],
  syllabus: '',
  upcomingExams: [],
  dailyStudyTime: '2 Hours',
  preferredLearningStyle: 'visual',
  studyDifficulties: [],
  onboarded: false
};

export const initialSubjects: Subject[] = [];

export const initialNotes: NoteItem[] = [];

export const initialStudyPlan: StudyPlanItem[] = [];

export const initialRevisionRadar: RevisionRadarItem[] = [];

export const initialMemoryShortcuts: MemoryShortcutItem[] = [];

export const initialExamPlan: ExamCountdown = {
  upcomingExams: [],
  dailySchedule: [],
  priorityTopics: []
};

export const initialMindMap: MindMapNode = {
  id: 'root',
  label: 'Curriculum Concepts',
  description: 'Visual conceptual hierarchy',
  children: []
};
