import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AcademicLevel, AcademicStream } from './prompts.js';

const baseDir = (typeof process.cwd === 'function' && process.cwd()) || (typeof __dirname === 'string' && __dirname) || '.';
const DATA_DIR = path.resolve(baseDir, 'data') || path.join(__dirname, '../data') || path.join(baseDir, 'data') || './data';
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const JWT_SECRET = String(process.env.JWT_SECRET || 'nova-jwt-secret-session-key-production-change').trim();

/**
 * User Schema:
 * id, name, email, passwordHash, academicLevel, stream, created_at
 */
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  academicLevel: AcademicLevel;
  stream: AcademicStream;
  isDemo?: boolean;
  created_at: string;
  createdAt?: string; // backwards compatibility alias
}

export interface TopicRecord {
  id: string;
  name: string;
  unitId?: string;
  subjectId?: string;
  status?: 'not-started' | 'learning' | 'needs-revision' | 'mastered';
  quizScore?: number;
  confidenceScore?: number;
  lastReviewedDaysAgo?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  summary?: string;
  notesCount?: number;
}

/**
 * Subject Schema:
 * id, userId, title, courseCode, targetExamDate, topics (JSON array), progress (0-100), created_at
 */
export interface SubjectRecord {
  id: string;
  userId: string;
  title: string;
  name?: string; // backwards compatibility alias with title
  courseCode: string;
  code?: string; // backwards compatibility alias with courseCode
  targetExamDate: string;
  topics: TopicRecord[];
  progress: number; // 0-100
  created_at: string;
  // Visual presentation fields
  description?: string;
  color?: string;
  accentColor?: string;
  units?: any[]; // hierarchical units mapping
}

export interface UserProfileRecord {
  userId: string;
  name: string;
  degree: string;
  college?: string;
  yearSemester: string;
  academicLevel: AcademicLevel;
  stream: AcademicStream;
  dailyStudyTime: string;
  preferredLearningStyle: string;
  studyDifficulties: string[];
  onboarded: boolean;
  streak: number;
  studyHours: number;
  updatedAt: string;
}

// Low-overhead file-backed store with guaranteed multi-tenant isolation and 100% clean canvas
class DatabaseStore {
  private usersFile = path.resolve(DATA_DIR, 'users.json') || path.join(DATA_DIR, 'users.json');

  public userStorePath(userId: string = 'default', collection: string = 'data'): string {
    const safeUserId = String(userId || 'default').trim() || 'default';
    const safeCollection = String(collection || 'data').trim() || 'data';
    const userDir = path.resolve(DATA_DIR, 'users_data', safeUserId) || path.join(DATA_DIR, 'users_data', safeUserId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    return path.resolve(userDir, `${safeCollection}.json`) || path.join(userDir, `${safeCollection}.json`);
  }

  constructor() {
    this.initDemoUser();
  }

  private readJson<T>(filePath: string, fallback: T): T {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(`Error reading JSON from ${filePath}:`, e);
    }
    return fallback;
  }

  private writeJson<T>(filePath: string, data: T): void {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Error writing JSON to ${filePath}:`, e);
    }
  }

  /**
   * Initializes completely empty JSON files for any user account.
   * Ensures 100% clean canvas:
   *   subjects.json -> []
   *   notes.json -> []
   *   flashcards.json -> []
   *   study_plans.json -> []
   *   radar.json -> { topics: [], weakSpots: [] }
   */
  public initUserStorage(userId: string, overwrite = false): void {
    const filesToInit: Array<{ name: string; defaultContent: any }> = [
      { name: 'subjects', defaultContent: [] },
      { name: 'notes', defaultContent: [] },
      { name: 'flashcards', defaultContent: [] },
      { name: 'study_plans', defaultContent: [] },
      { name: 'study_plan', defaultContent: [] },
      { name: 'radar', defaultContent: { topics: [], weakSpots: [] } },
      { name: 'revision_radar', defaultContent: [] },
      { name: 'mind_maps', defaultContent: {} },
      { name: 'memory_shortcuts', defaultContent: [] },
      { name: 'exam_plan', defaultContent: { upcomingExams: [], dailySchedule: [], priorityTopics: [] } }
    ];

    for (const item of filesToInit) {
      const filePath = this.userStorePath(userId, item.name);
      if (overwrite || !fs.existsSync(filePath)) {
        this.writeJson(filePath, item.defaultContent);
      }
    }
  }

  // Initialize demo user with 100% clean canvas (zero mock data)
  private initDemoUser() {
    const users = this.getUsers();
    const demoEmail = 'demo@nova.study';
    let demoUser = users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());

    const now = new Date().toISOString();
    if (!demoUser) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('student123', salt);
      demoUser = {
        id: 'demo-student-id',
        name: 'Stuti (Demo)',
        email: demoEmail,
        passwordHash: hash,
        academicLevel: 'Undergrad',
        stream: 'Computer Science',
        isDemo: true,
        created_at: now,
        createdAt: now
      };
      users.push(demoUser);
      this.writeJson(this.usersFile, users);
    }

    // Always enforce clean canvas for demo user
    const demoProfile: UserProfileRecord = {
      userId: demoUser.id,
      name: 'Stuti',
      degree: 'Computer Science (Undergrad)',
      college: '',
      yearSemester: 'Undergrad',
      academicLevel: 'Undergrad',
      stream: 'Computer Science',
      dailyStudyTime: '2-3 hours',
      preferredLearningStyle: 'visual',
      studyDifficulties: [],
      onboarded: true,
      streak: 0,
      studyHours: 0,
      updatedAt: now
    };
    this.saveUserProfile(demoUser.id, demoProfile);

    // Initialize clean canvas files
    this.initUserStorage(demoUser.id, true);
  }

  // Users management
  public getUsers(): UserRecord[] {
    return this.readJson<UserRecord[]>(this.usersFile, []);
  }

  public findUserByEmail(email: string): UserRecord | undefined {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public findUserById(id: string): UserRecord | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  }

  public createUser(
    email: string,
    passwordPlain: string,
    name: string,
    academicLevel: AcademicLevel = 'Undergrad',
    stream: AcademicStream = 'General',
    isDemo = false
  ): UserRecord {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(passwordPlain, salt);
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      academicLevel,
      stream,
      isDemo,
      created_at: now,
      createdAt: now
    };

    users.push(newUser);
    this.writeJson(this.usersFile, users);

    // Initial clean profile
    const profile: UserProfileRecord = {
      userId: newUser.id,
      name: newUser.name,
      degree: stream === 'General' ? academicLevel : `${stream} (${academicLevel})`,
      college: '',
      yearSemester: academicLevel,
      academicLevel,
      stream,
      dailyStudyTime: '2-3 hours',
      preferredLearningStyle: 'visual',
      studyDifficulties: [],
      onboarded: true,
      streak: 0,
      studyHours: 0,
      updatedAt: now
    };
    this.saveUserProfile(newUser.id, profile);

    // Initialize 100% clean canvas storage files for this new user
    this.initUserStorage(newUser.id, true);

    return newUser;
  }

  public verifyPassword(user: UserRecord, passwordPlain: string): boolean {
    return bcrypt.compareSync(passwordPlain, user.passwordHash);
  }

  public generateToken(user: UserRecord): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        academicLevel: user.academicLevel,
        stream: user.stream,
        isDemo: Boolean(user.isDemo)
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  }

  public verifyToken(token: string): { 
    id: string; 
    email: string; 
    name: string; 
    academicLevel?: AcademicLevel; 
    stream?: AcademicStream; 
    isDemo: boolean 
  } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch (e) {
      return null;
    }
  }

  // Profile operations
  public getUserProfile(userId: string): UserProfileRecord {
    const p = this.userStorePath(userId, 'profile');
    const user = this.findUserById(userId);
    const defaultProfile: UserProfileRecord = {
      userId,
      name: user?.name || 'Student',
      degree: user?.stream ? `${user.stream} (${user.academicLevel})` : '',
      college: '',
      yearSemester: user?.academicLevel || 'Undergrad',
      academicLevel: user?.academicLevel || 'Undergrad',
      stream: user?.stream || 'General',
      dailyStudyTime: '2-3 hours',
      preferredLearningStyle: 'visual',
      studyDifficulties: [],
      onboarded: true,
      streak: 0,
      studyHours: 0,
      updatedAt: new Date().toISOString()
    };
    return this.readJson<UserProfileRecord>(p, defaultProfile);
  }

  public saveUserProfile(userId: string, profile: Partial<UserProfileRecord>): UserProfileRecord {
    const current = this.getUserProfile(userId);
    const updated = {
      ...current,
      ...profile,
      userId,
      updatedAt: new Date().toISOString()
    };
    const p = this.userStorePath(userId, 'profile');
    this.writeJson(p, updated);
    return updated;
  }

  // -----------------------------------------------------------------
  // SUBJECT CRUD & MULTI-TENANT QUERIES
  // -----------------------------------------------------------------
  public getUserSubjects(userId: string): SubjectRecord[] {
    const subjects = this.getUserCollection<SubjectRecord[]>(userId, 'subjects', []);
    if (!Array.isArray(subjects)) {
      return [];
    }
    // Normalize aliases for compatibility with legacy and v2 schemas
    return subjects.map(s => ({
      ...s,
      userId,
      name: s.name || s.title || 'Untitled Subject',
      title: s.title || s.name || 'Untitled Subject',
      code: s.code || s.courseCode || 'SUB101',
      courseCode: s.courseCode || s.code || 'SUB101',
      targetExamDate: s.targetExamDate || '2026-12-15',
      topics: s.topics || (s.units ? s.units.flatMap((u: any) => u.topics || []) : []),
      progress: typeof s.progress === 'number' ? s.progress : 0,
      created_at: s.created_at || new Date().toISOString()
    }));
  }

  public saveUserSubjects(userId: string, subjects: SubjectRecord[]): void {
    this.saveUserCollection(userId, 'subjects', subjects);
  }

  public addSubject(userId: string, subjectData: Partial<SubjectRecord>): SubjectRecord {
    const subjects = this.getUserSubjects(userId);
    const title = subjectData.title || subjectData.name || 'New Subject';
    const courseCode = subjectData.courseCode || subjectData.code || `SUB${subjects.length + 1}`;
    const targetExamDate = subjectData.targetExamDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const now = new Date().toISOString();

    const topics: TopicRecord[] = subjectData.topics || [
      {
        id: `t_${Date.now()}_1`,
        name: `${title} Foundations`,
        status: 'not-started',
        quizScore: 0,
        confidenceScore: 30,
        difficulty: 'medium',
        lastReviewedDaysAgo: 0
      }
    ];

    const units = subjectData.units || [
      {
        id: `u_${Date.now()}_1`,
        unitNumber: 1,
        title: 'Unit 1: Core Curriculum',
        topics
      }
    ];

    const newSubject: SubjectRecord = {
      id: subjectData.id || `subj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title,
      name: title,
      courseCode,
      code: courseCode,
      targetExamDate,
      topics,
      units,
      progress: subjectData.progress || 0,
      description: subjectData.description || `Comprehensive study curriculum for ${title}.`,
      color: subjectData.color || 'indigo',
      accentColor: subjectData.accentColor || '#818cf8',
      created_at: now
    };

    subjects.push(newSubject);
    this.saveUserSubjects(userId, subjects);

    // Update profile subjects cache
    const profile = this.getUserProfile(userId);
    const existingSubjectNames = subjects.map(s => s.title);
    this.saveUserProfile(userId, { ...profile, subjects: existingSubjectNames } as any);

    return newSubject;
  }

  public deleteSubject(userId: string, subjectId: string): boolean {
    const subjects = this.getUserSubjects(userId);
    const filtered = subjects.filter(s => s.id !== subjectId);
    if (filtered.length === subjects.length) {
      return false;
    }
    this.saveUserSubjects(userId, filtered);

    // Update profile
    const profile = this.getUserProfile(userId);
    const existingSubjectNames = filtered.map(s => s.title);
    this.saveUserProfile(userId, { ...profile, subjects: existingSubjectNames } as any);
    return true;
  }

  // Generic user collection storage (guaranteed user isolation, never falling back to other users)
  public getUserCollection<T>(userId: string, collection: string, fallback: T): T {
    const p = this.userStorePath(userId, collection);
    return this.readJson<T>(p, fallback);
  }

  public saveUserCollection<T>(userId: string, collection: string, data: T): void {
    const p = this.userStorePath(userId, collection);
    this.writeJson(p, data);
  }
}

export const db = new DatabaseStore();
