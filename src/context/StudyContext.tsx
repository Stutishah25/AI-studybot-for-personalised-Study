import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  StudentProfile,
  Subject,
  StudyPlanItem,
  NoteItem,
  MindMapNode,
  MemoryShortcutItem,
  ExamCountdown,
  RevisionRadarItem
} from '../types';
import {
  initialStudentProfile,
  initialSubjects,
  initialStudyPlan,
  initialNotes,
  initialMindMap,
  initialMemoryShortcuts,
  initialRevisionRadar,
  initialExamPlan
} from '../demoData';
import { useAuth } from './AuthContext';

interface StudyContextType {
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  subjects: Subject[];
  currentSubjectId: string;
  setCurrentSubjectId: (id: string) => void;
  currentSubject: Subject | undefined;
  addSubject: (subject: Partial<Subject>) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  parseSyllabus: (syllabusText: string, subjectName?: string) => Promise<any[]>;
  studyPlan: StudyPlanItem[];
  toggleStudyPlanItem: (id: string) => void;
  addStudyPlanItem: (item: Omit<StudyPlanItem, 'id' | 'completed'>) => void;
  notes: NoteItem[];
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<NoteItem>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  mindMaps: Record<string, MindMapNode>;
  currentMindMap: MindMapNode;
  setCurrentMindMap: (map: MindMapNode) => void;
  saveMindMap: (topic: string, map: MindMapNode) => Promise<void>;
  memoryShortcuts: MemoryShortcutItem[];
  addMemoryShortcut: (shortcut: Omit<MemoryShortcutItem, 'id' | 'createdAt'>) => Promise<void>;
  deleteMemoryShortcut: (id: string) => Promise<void>;
  revisionRadar: RevisionRadarItem[];
  markTopicReviewed: (id: string) => Promise<void>;
  examPlan: ExamCountdown;
  addExam: (subject: string, date: string, targetGrade?: string) => Promise<void>;
  deleteExam: (index: number) => Promise<void>;
  updateExamPlan: (plan: ExamCountdown) => void;
  updateTopicStatus: (
    subjectId: string,
    topicId: string,
    status: 'not-started' | 'learning' | 'needs-revision' | 'mastered',
    scoreDelta?: number
  ) => void;
  recordQuizAttempt: (attempt: {
    topic: string;
    subject: string;
    difficulty: string;
    score: number;
    total: number;
    answers?: any[];
  }) => Promise<void>;
  recordStudySession: (durationMinutes: number, topic?: string, soundscape?: string) => Promise<void>;
  streak: number;
  studyHours: number;
  incrementStudyTime: (minutes: number) => void;
  isFocusModeOpen: boolean;
  setIsFocusModeOpen: (open: boolean) => void;
  isCommandBarOpen: boolean;
  setIsCommandBarOpen: (open: boolean) => void;
  isSubjectModalOpen: boolean;
  setIsSubjectModalOpen: (open: boolean) => void;
  resetToDemoData: () => void;
  isLoadingUserData: boolean;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<StudentProfile>(initialStudentProfile);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubjectId, setCurrentSubjectId] = useState<string>('');
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [mindMaps, setMindMaps] = useState<Record<string, MindMapNode>>({});
  const [currentMindMap, setCurrentMindMap] = useState<MindMapNode>(initialMindMap);
  const [memoryShortcuts, setMemoryShortcuts] = useState<MemoryShortcutItem[]>([]);
  const [revisionRadar, setRevisionRadar] = useState<RevisionRadarItem[]>([]);
  const [examPlan, setExamPlan] = useState<ExamCountdown>(initialExamPlan);
  const [streak, setStreak] = useState<number>(0);
  const [studyHours, setStudyHours] = useState<number>(0);

  const [isFocusModeOpen, setIsFocusModeOpen] = useState<boolean>(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState<boolean>(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState<boolean>(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(false);

  // Helper for authenticated API calls
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      };
      return fetch(url, { ...options, headers });
    },
    [token]
  );

  // Load user data whenever authenticated user or token changes
  useEffect(() => {
    async function loadUserData() {
      if (!token || !user) {
        // Fall back to clean default or initial demo
        return;
      }

      setIsLoadingUserData(true);
      try {
        // 1. Fetch user profile
        const profileRes = await authFetch('/api/auth/me');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile) {
            setProfile(prev => ({
              ...prev,
              ...profileData.profile,
              name: profileData.user?.name || profileData.profile.name || prev.name
            }));
            if (profileData.profile.streak !== undefined) setStreak(profileData.profile.streak);
            if (profileData.profile.studyHours !== undefined) setStudyHours(profileData.profile.studyHours);
          }
        }

        // 2. Fetch subjects (v2 persistent multi-tenant endpoint)
        const subjectsRes = await authFetch('/api/v2/subjects');
        if (subjectsRes.ok) {
          const subjData = await subjectsRes.json();
          if (Array.isArray(subjData.subjects)) {
            const normalized = subjData.subjects.map((s: any) => ({
              ...s,
              name: s.name || s.title,
              title: s.title || s.name,
              code: s.code || s.courseCode,
              courseCode: s.courseCode || s.code,
              topics: s.topics || (s.units ? s.units.flatMap((u: any) => u.topics || []) : []),
              units: s.units || [
                {
                  id: `u_${s.id}_1`,
                  unitNumber: 1,
                  title: 'Core Curriculum',
                  topics: s.topics || []
                }
              ]
            }));
            setSubjects(normalized);
            if (normalized.length > 0) {
              setCurrentSubjectId(normalized[0].id);
            } else {
              setCurrentSubjectId('');
            }
          }
        }

        // 3. Fetch notes (v2 with fallback)
        const notesRes = await authFetch('/api/v2/notes');
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          if (Array.isArray(notesData.notes)) {
            setNotes(notesData.notes);
          }
        }

        // 4. Fetch mind maps
        const mmRes = await authFetch('/api/user/mind-maps');
        if (mmRes.ok) {
          const mmData = await mmRes.json();
          if (mmData.mindMaps && typeof mmData.mindMaps === 'object') {
            setMindMaps(mmData.mindMaps);
            const keys = Object.keys(mmData.mindMaps);
            if (keys.length > 0) {
              setCurrentMindMap(mmData.mindMaps[keys[0]]);
            }
          }
        }

        // 5. Fetch memory shortcuts
        const scRes = await authFetch('/api/user/memory-shortcuts');
        if (scRes.ok) {
          const scData = await scRes.json();
          if (Array.isArray(scData.memoryShortcuts)) {
            setMemoryShortcuts(scData.memoryShortcuts);
          }
        }

        // 6. Fetch revision radar (v2 with fallback)
        const radarRes = await authFetch('/api/v2/radar');
        if (radarRes.ok) {
          const radarData = await radarRes.json();
          if (Array.isArray(radarData.revisionRadar)) {
            setRevisionRadar(radarData.revisionRadar);
          } else if (Array.isArray(radarData.radar?.weakSpots)) {
            setRevisionRadar(radarData.radar.weakSpots);
          }
        }

        // 7. Fetch exam plan
        const examRes = await authFetch('/api/user/exam-plan');
        if (examRes.ok) {
          const examData = await examRes.json();
          if (examData.examPlan) {
            setExamPlan(examData.examPlan);
          }
        }

        // 8. Fetch study plan
        const planRes = await authFetch('/api/user/study-plan');
        if (planRes.ok) {
          const planData = await planRes.json();
          if (Array.isArray(planData.studyPlan)) {
            setStudyPlan(planData.studyPlan);
          }
        }
      } catch (err) {
        console.error('Error fetching user data from backend:', err);
      } finally {
        setIsLoadingUserData(false);
      }
    }

    loadUserData();
  }, [token, user, authFetch]);

  // Current active subject
  const currentSubject = subjects.find(s => s.id === currentSubjectId) || subjects[0];

  // Update profile
  const updateProfile = async (updates: Partial<StudentProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    if (token) {
      try {
        await authFetch('/api/user/profile', {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
      } catch (err) {
        console.error('Failed to sync profile updates to backend:', err);
      }
    }
  };

  // Add Subject (v2 API)
  const addSubject = async (subjectData: Partial<Subject>) => {
    if (token) {
      try {
        const payload = {
          title: subjectData.title || subjectData.name,
          name: subjectData.name || subjectData.title,
          courseCode: subjectData.courseCode || subjectData.code,
          code: subjectData.code || subjectData.courseCode,
          academicLevel: (subjectData as any).academicLevel || profile.academicLevel || user?.academicLevel,
          stream: (subjectData as any).stream || profile.stream || user?.stream,
          targetExamDate: subjectData.targetExamDate,
          description: subjectData.description,
          customNotes: (subjectData as any).customNotes,
          color: subjectData.color,
          accentColor: subjectData.accentColor,
          presetTopics: subjectData.topics || (subjectData.units ? subjectData.units.flatMap(u => u.topics) : undefined)
        };

        const res = await authFetch('/api/v2/subjects', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.subject) {
          const newSubj: Subject = {
            ...data.subject,
            name: data.subject.name || data.subject.title,
            title: data.subject.title || data.subject.name,
            code: data.subject.code || data.subject.courseCode,
            courseCode: data.subject.courseCode || data.subject.code,
            units: data.subject.units || [
              {
                id: `u_${data.subject.id}_1`,
                unitNumber: 1,
                title: 'Core Curriculum',
                topics: data.subject.topics || []
              }
            ]
          };
          setSubjects(prev => [...prev.filter(s => s.id !== newSubj.id), newSubj]);
          setCurrentSubjectId(newSubj.id);
          return;
        }
      } catch (err) {
        console.error('Failed to create subject on server:', err);
      }
    }

    // Local fallback
    const newSubject: Subject = {
      id: `subj_${Date.now()}`,
      title: subjectData.title || subjectData.name || 'New Subject',
      name: subjectData.name || subjectData.title || 'New Subject',
      courseCode: subjectData.courseCode || subjectData.code || 'CS101',
      code: subjectData.code || subjectData.courseCode || 'CS101',
      targetExamDate: subjectData.targetExamDate || '2026-11-20',
      description: subjectData.description || 'Subject description',
      progress: 0,
      color: subjectData.color || 'indigo',
      accentColor: subjectData.accentColor || '#818cf8',
      topics: subjectData.topics || [],
      units: subjectData.units || []
    };
    setSubjects(prev => [...prev, newSubject]);
    setCurrentSubjectId(newSubject.id);
  };

  // Update Subject
  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    if (token) {
      try {
        await authFetch(`/api/user/subjects/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Delete Subject (v2 API)
  const deleteSubject = async (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    if (token) {
      try {
        await authFetch(`/api/v2/subjects/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Parse Syllabus with AI
  const parseSyllabus = async (syllabusText: string, subjectName?: string) => {
    try {
      const res = await authFetch('/api/user/subjects/parse-syllabus', {
        method: 'POST',
        body: JSON.stringify({ syllabusText, subjectName })
      });
      const data = await res.json();
      return data.units || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Study Plan
  const toggleStudyPlanItem = (id: string) => {
    setStudyPlan(prev => {
      const next = prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item));
      if (token) {
        authFetch('/api/user/study-plan', {
          method: 'PUT',
          body: JSON.stringify({ studyPlan: next })
        }).catch(() => {});
      }
      return next;
    });
  };

  const addStudyPlanItem = (item: Omit<StudyPlanItem, 'id' | 'completed'>) => {
    const newItem: StudyPlanItem = {
      ...item,
      id: `sp-${Date.now()}`,
      completed: false
    };
    setStudyPlan(prev => {
      const next = [newItem, ...prev];
      if (token) {
        authFetch('/api/user/study-plan', {
          method: 'PUT',
          body: JSON.stringify({ studyPlan: next })
        }).catch(() => {});
      }
      return next;
    });
  };

  // Notes
  const addNote = async (note: Omit<NoteItem, 'id' | 'createdAt'>) => {
    if (token) {
      try {
        const res = await authFetch('/api/user/notes', {
          method: 'POST',
          body: JSON.stringify(note)
        });
        const data = await res.json();
        if (data.success && data.note) {
          setNotes(prev => [data.note, ...prev]);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    const newNote: NoteItem = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = async (id: string, updates: Partial<NoteItem>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)));
    if (token) {
      try {
        await authFetch(`/api/user/notes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (token) {
      try {
        await authFetch(`/api/user/notes/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Mind Map
  const saveMindMap = async (topic: string, map: MindMapNode) => {
    setMindMaps(prev => ({ ...prev, [topic]: map }));
    setCurrentMindMap(map);
    if (token) {
      try {
        await authFetch('/api/user/mind-maps', {
          method: 'POST',
          body: JSON.stringify({ key: topic, data: map })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Memory Shortcuts
  const addMemoryShortcut = async (shortcut: Omit<MemoryShortcutItem, 'id' | 'createdAt'>) => {
    if (token) {
      try {
        const res = await authFetch('/api/user/memory-shortcuts', {
          method: 'POST',
          body: JSON.stringify(shortcut)
        });
        const data = await res.json();
        if (data.success && data.memoryShortcut) {
          setMemoryShortcuts(prev => [data.memoryShortcut, ...prev]);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    const newShortcut: MemoryShortcutItem = {
      ...shortcut,
      id: `sc-${Date.now()}`,
      createdAt: 'Just now'
    };
    setMemoryShortcuts(prev => [newShortcut, ...prev]);
  };

  const deleteMemoryShortcut = async (id: string) => {
    setMemoryShortcuts(prev => prev.filter(s => s.id !== id));
    if (token) {
      try {
        await authFetch(`/api/user/memory-shortcuts/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Spaced Repetition (Revision Radar)
  const markTopicReviewed = async (id: string) => {
    const item = revisionRadar.find(r => r.id === id);
    setRevisionRadar(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              lastReviewedDaysAgo: 0,
              retentionEstimate: 95,
              status: 'recently-reviewed',
              urgency: 'low',
              reason: 'Reviewed just now! Retention curve reset.'
            }
          : r
      )
    );

    if (token && item) {
      try {
        await authFetch('/api/user/revision-radar/reviewed', {
          method: 'POST',
          body: JSON.stringify({ topic: item.topic })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Exam Management
  const addExam = async (subject: string, date: string, targetGrade = 'A') => {
    if (token) {
      try {
        const res = await authFetch('/api/user/exams', {
          method: 'POST',
          body: JSON.stringify({ subject, date, targetGrade })
        });
        const data = await res.json();
        if (data.success && data.examPlan) {
          setExamPlan(data.examPlan);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Local fallback calculation
    const diff = Math.max(1, Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    setExamPlan(prev => ({
      ...prev,
      upcomingExams: [...prev.upcomingExams, { subject, date, daysLeft: diff, targetGrade }].sort(
        (a, b) => a.daysLeft - b.daysLeft
      )
    }));
  };

  const deleteExam = async (index: number) => {
    if (token) {
      try {
        const res = await authFetch(`/api/user/exams/${index}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success && data.examPlan) {
          setExamPlan(data.examPlan);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setExamPlan(prev => ({
      ...prev,
      upcomingExams: prev.upcomingExams.filter((_, i) => i !== index)
    }));
  };

  const updateExamPlan = (plan: ExamCountdown) => {
    setExamPlan(plan);
  };

  // Update Topic Status & Progress
  const updateTopicStatus = (
    subjectId: string,
    topicId: string,
    status: 'not-started' | 'learning' | 'needs-revision' | 'mastered',
    scoreDelta = 0
  ) => {
    setSubjects(prev =>
      prev.map(subject => {
        if (subject.id !== subjectId) return subject;
        const updatedUnits = subject.units.map(unit => ({
          ...unit,
          topics: unit.topics.map(t => {
            if (t.id !== topicId) return t;
            const newScore = Math.min(100, Math.max(0, t.quizScore + scoreDelta));
            return {
              ...t,
              status,
              quizScore: newScore,
              lastReviewedDaysAgo: 0
            };
          })
        }));

        const allTopics = updatedUnits.flatMap(u => u.topics);
        const masteredCount = allTopics.filter(t => t.status === 'mastered').length;
        const learningCount = allTopics.filter(t => t.status === 'learning').length;
        const progress = Math.round(((masteredCount * 1 + learningCount * 0.5) / (allTopics.length || 1)) * 100);

        return {
          ...subject,
          progress,
          units: updatedUnits
        };
      })
    );
  };

  // Record Quiz Attempt (Dynamic Weak Topic & Mastery Updater)
  const recordQuizAttempt = async (attempt: {
    topic: string;
    subject: string;
    difficulty: string;
    score: number;
    total: number;
    answers?: any[];
  }) => {
    const accuracy = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;

    // Locally update topic score in subject
    setSubjects(prev =>
      prev.map(subj => {
        if (!subj.units) return subj;
        let modified = false;
        const updatedUnits = subj.units.map(unit => ({
          ...unit,
          topics: unit.topics.map(t => {
            if (t.name.toLowerCase() === attempt.topic.toLowerCase()) {
              modified = true;
              return {
                ...t,
                quizScore: accuracy,
                confidenceScore: Math.min(100, Math.round(accuracy * 0.9 + 10)),
                status: accuracy >= 80 ? 'mastered' : accuracy >= 60 ? 'learning' : 'needs-revision',
                lastReviewedDaysAgo: 0
              };
            }
            return t;
          })
        }));

        if (!modified) return subj;
        const allTopics = updatedUnits.flatMap(u => u.topics);
        const mastered = allTopics.filter(t => t.status === 'mastered').length;
        const learning = allTopics.filter(t => t.status === 'learning').length;
        const progress = Math.round(((mastered * 1 + learning * 0.5) / (allTopics.length || 1)) * 100);
        return { ...subj, progress, units: updatedUnits };
      })
    );

    if (token) {
      try {
        await authFetch('/api/user/quizzes/attempt', {
          method: 'POST',
          body: JSON.stringify(attempt)
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Focus Sessions & Study Time Tracking
  const recordStudySession = async (durationMinutes: number, topic?: string, soundscape?: string) => {
    const hours = Number((durationMinutes / 60).toFixed(1));
    setStudyHours(prev => Number((prev + hours).toFixed(1)));

    if (token) {
      try {
        await authFetch('/api/user/study-sessions', {
          method: 'POST',
          body: JSON.stringify({
            durationMinutes,
            topic: topic || currentSubject?.name || 'General Study',
            subject: currentSubject?.name || 'General',
            soundscape
          })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const incrementStudyTime = (minutes: number) => {
    setStudyHours(prev => Number((prev + minutes / 60).toFixed(1)));
  };

  const resetToDemoData = () => {
    setProfile(initialStudentProfile);
    setSubjects([]);
    setStudyPlan([]);
    setNotes([]);
    setMindMaps({});
    setCurrentMindMap(initialMindMap);
    setMemoryShortcuts([]);
    setRevisionRadar([]);
    setExamPlan(initialExamPlan);
    setStreak(0);
    setStudyHours(0);
    setCurrentSubjectId('');
  };

  return (
    <StudyContext.Provider
      value={{
        profile,
        updateProfile,
        subjects,
        currentSubjectId,
        setCurrentSubjectId,
        currentSubject,
        addSubject,
        updateSubject,
        deleteSubject,
        parseSyllabus,
        studyPlan,
        toggleStudyPlanItem,
        addStudyPlanItem,
        notes,
        addNote,
        updateNote,
        deleteNote,
        mindMaps,
        currentMindMap,
        setCurrentMindMap,
        saveMindMap,
        memoryShortcuts,
        addMemoryShortcut,
        deleteMemoryShortcut,
        revisionRadar,
        markTopicReviewed,
        examPlan,
        addExam,
        deleteExam,
        updateExamPlan,
        updateTopicStatus,
        recordQuizAttempt,
        recordStudySession,
        streak,
        studyHours,
        incrementStudyTime,
        isFocusModeOpen,
        setIsFocusModeOpen,
        isCommandBarOpen,
        setIsCommandBarOpen,
        isSubjectModalOpen,
        setIsSubjectModalOpen,
        resetToDemoData,
        isLoadingUserData
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
