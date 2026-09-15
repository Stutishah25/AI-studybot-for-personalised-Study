import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initialSubjects, initialNotes, initialMindMap, initialMemoryShortcuts, initialRevisionRadar, initialExamPlan, initialStudyPlan } from '../src/demoData.js';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const JWT_SECRET = process.env.JWT_SECRET || 'nova-jwt-secret-session-key-production-change';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface UserProfileRecord {
  userId: string;
  name: string;
  degree: string;
  college?: string;
  yearSemester: string;
  dailyStudyTime: string;
  preferredLearningStyle: string;
  studyDifficulties: string[];
  onboarded: boolean;
  streak: number;
  studyHours: number;
  updatedAt: string;
}

// Low-overhead file-backed store with memory cache
class DatabaseStore {
  private usersFile = path.join(DATA_DIR, 'users.json');
  private userStorePath(userId: string, collection: string) {
    const userDir = path.join(DATA_DIR, 'users_data', userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    return path.join(userDir, `${collection}.json`);
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

  // Seed demo student user
  private initDemoUser() {
    const users = this.getUsers();
    const demoEmail = 'demo@nova.study';
    let demoUser = users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());

    if (!demoUser) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('student123', salt);
      demoUser = {
        id: 'demo-student-id',
        email: demoEmail,
        passwordHash: hash,
        name: 'Stuti (Demo)',
        isDemo: true,
        createdAt: new Date().toISOString()
      };
      users.push(demoUser);
      this.writeJson(this.usersFile, users);

      // Seed initial demo profile & data
      const demoProfile: UserProfileRecord = {
        userId: demoUser.id,
        name: 'Stuti',
        degree: 'B.Tech in Computer Engineering',
        college: 'Sardar Patel Institute of Technology',
        yearSemester: '3rd Year • Semester 6',
        dailyStudyTime: '3-4 hours',
        preferredLearningStyle: 'visual',
        studyDifficulties: ['remembering-info', 'solving-problems', 'revising-before-exams'],
        onboarded: true,
        streak: 7,
        studyHours: 42.5,
        updatedAt: new Date().toISOString()
      };
      this.saveUserProfile(demoUser.id, demoProfile);
      this.saveUserCollection(demoUser.id, 'subjects', initialSubjects);
      this.saveUserCollection(demoUser.id, 'notes', initialNotes);
      this.saveUserCollection(demoUser.id, 'mind_maps', { default: initialMindMap });
      this.saveUserCollection(demoUser.id, 'memory_shortcuts', initialMemoryShortcuts);
      this.saveUserCollection(demoUser.id, 'revision_radar', initialRevisionRadar);
      this.saveUserCollection(demoUser.id, 'exam_plan', initialExamPlan);
      this.saveUserCollection(demoUser.id, 'study_plan', initialStudyPlan);
    }
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

  public createUser(email: string, passwordPlain: string, name: string, isDemo = false): UserRecord {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(passwordPlain, salt);
    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      email: email.trim().toLowerCase(),
      passwordHash,
      name: name.trim(),
      isDemo,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.writeJson(this.usersFile, users);

    // Initial blank profile for new non-demo user
    const profile: UserProfileRecord = {
      userId: newUser.id,
      name: newUser.name,
      degree: '',
      college: '',
      yearSemester: '',
      dailyStudyTime: '2-3 hours',
      preferredLearningStyle: 'visual',
      studyDifficulties: [],
      onboarded: isDemo ? true : false,
      streak: 1,
      studyHours: 0,
      updatedAt: new Date().toISOString()
    };
    this.saveUserProfile(newUser.id, profile);

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
        isDemo: Boolean(user.isDemo)
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  }

  public verifyToken(token: string): { id: string; email: string; name: string; isDemo: boolean } | null {
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
      degree: '',
      college: '',
      yearSemester: '',
      dailyStudyTime: '2-3 hours',
      preferredLearningStyle: 'visual',
      studyDifficulties: [],
      onboarded: false,
      streak: 1,
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

  // Generic user collection storage (guaranteed user isolation)
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
