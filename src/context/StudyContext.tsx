import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface StudyContextType {
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  subjects: Subject[];
  currentSubjectId: string;
  setCurrentSubjectId: (id: string) => void;
  currentSubject: Subject | undefined;
  studyPlan: StudyPlanItem[];
  toggleStudyPlanItem: (id: string) => void;
  addStudyPlanItem: (item: Omit<StudyPlanItem, 'id' | 'completed'>) => void;
  notes: NoteItem[];
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt'>) => void;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  mindMaps: Record<string, MindMapNode>;
  currentMindMap: MindMapNode;
  setCurrentMindMap: (map: MindMapNode) => void;
  saveMindMap: (topic: string, map: MindMapNode) => void;
  memoryShortcuts: MemoryShortcutItem[];
  addMemoryShortcut: (shortcut: Omit<MemoryShortcutItem, 'id' | 'createdAt'>) => void;
  deleteMemoryShortcut: (id: string) => void;
  revisionRadar: RevisionRadarItem[];
  markTopicReviewed: (id: string) => void;
  examPlan: ExamCountdown;
  updateExamPlan: (plan: ExamCountdown) => void;
  updateTopicStatus: (
    subjectId: string,
    topicId: string,
    status: 'not-started' | 'learning' | 'needs-revision' | 'mastered',
    scoreDelta?: number
  ) => void;
  streak: number;
  studyHours: number;
  incrementStudyTime: (minutes: number) => void;
  isFocusModeOpen: boolean;
  setIsFocusModeOpen: (open: boolean) => void;
  isCommandBarOpen: boolean;
  setIsCommandBarOpen: (open: boolean) => void;
  resetToDemoData: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nova_study_companion_state_v1';

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or demoData
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : initialStudentProfile;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_subjects`);
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [currentSubjectId, setCurrentSubjectId] = useState<string>('dsa');

  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_plan`);
    return saved ? JSON.parse(saved) : initialStudyPlan;
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notes`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((n: any) => ({
            ...n,
            type: n.type || n.noteType || 'study-notes',
            noteType: n.noteType || n.type || 'study-notes',
            summary: n.summary || (n.content ? n.content.slice(0, 80).replace(/[#*`\n]/g, ' ') : 'Study Note')
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialNotes;
  });

  const [mindMaps, setMindMaps] = useState<Record<string, MindMapNode>>({
    'Operating System Architecture': initialMindMap
  });
  const [currentMindMap, setCurrentMindMap] = useState<MindMapNode>(initialMindMap);

  const [memoryShortcuts, setMemoryShortcuts] = useState<MemoryShortcutItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_shortcuts`);
    return saved ? JSON.parse(saved) : initialMemoryShortcuts;
  });

  const [revisionRadar, setRevisionRadar] = useState<RevisionRadarItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_radar`);
    return saved ? JSON.parse(saved) : initialRevisionRadar;
  });

  const [examPlan, setExamPlan] = useState<ExamCountdown>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_exam`);
    return saved ? JSON.parse(saved) : initialExamPlan;
  });

  const [streak, setStreak] = useState<number>(12);
  const [studyHours, setStudyHours] = useState<number>(18.5);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState<boolean>(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_subjects`, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_plan`, JSON.stringify(studyPlan));
  }, [studyPlan]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notes`, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_shortcuts`, JSON.stringify(memoryShortcuts));
  }, [memoryShortcuts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_radar`, JSON.stringify(revisionRadar));
  }, [revisionRadar]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_exam`, JSON.stringify(examPlan));
  }, [examPlan]);

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const currentSubject = subjects.find(s => s.id === currentSubjectId) || subjects[0];

  const toggleStudyPlanItem = (id: string) => {
    setStudyPlan(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const addStudyPlanItem = (item: Omit<StudyPlanItem, 'id' | 'completed'>) => {
    const newItem: StudyPlanItem = {
      ...item,
      id: `sp-${Date.now()}`,
      completed: false
    };
    setStudyPlan(prev => [newItem, ...prev]);
  };

  const addNote = (note: Omit<NoteItem, 'id' | 'createdAt'>) => {
    const newNote: NoteItem = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, updates: Partial<NoteItem>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const saveMindMap = (topic: string, map: MindMapNode) => {
    setMindMaps(prev => ({ ...prev, [topic]: map }));
    setCurrentMindMap(map);
  };

  const addMemoryShortcut = (shortcut: Omit<MemoryShortcutItem, 'id' | 'createdAt'>) => {
    const newShortcut: MemoryShortcutItem = {
      ...shortcut,
      id: `sc-${Date.now()}`,
      createdAt: 'Just now'
    };
    setMemoryShortcuts(prev => [newShortcut, ...prev]);
  };

  const deleteMemoryShortcut = (id: string) => {
    setMemoryShortcuts(prev => prev.filter(s => s.id !== id));
  };

  const markTopicReviewed = (id: string) => {
    setRevisionRadar(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              lastReviewedDaysAgo: 0,
              retentionEstimate: 95,
              status: 'recently-reviewed',
              urgency: 'low',
              reason: 'Reviewed just now! Retention curve reset.'
            }
          : item
      )
    );
  };

  const updateExamPlan = (plan: ExamCountdown) => {
    setExamPlan(plan);
  };

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

        // Recalculate subject progress
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

  const incrementStudyTime = (minutes: number) => {
    setStudyHours(prev => Number((prev + minutes / 60).toFixed(1)));
  };

  const resetToDemoData = () => {
    setProfile(initialStudentProfile);
    setSubjects(initialSubjects);
    setStudyPlan(initialStudyPlan);
    setNotes(initialNotes);
    setMindMaps({ 'Operating System Architecture': initialMindMap });
    setCurrentMindMap(initialMindMap);
    setMemoryShortcuts(initialMemoryShortcuts);
    setRevisionRadar(initialRevisionRadar);
    setExamPlan(initialExamPlan);
    setStreak(12);
    setStudyHours(18.5);
    localStorage.clear();
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
        updateExamPlan,
        updateTopicStatus,
        streak,
        studyHours,
        incrementStudyTime,
        isFocusModeOpen,
        setIsFocusModeOpen,
        isCommandBarOpen,
        setIsCommandBarOpen,
        resetToDemoData
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
