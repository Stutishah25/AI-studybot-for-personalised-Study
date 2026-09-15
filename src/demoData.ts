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

export const initialStudentProfile: StudentProfile = {
  name: 'Stuti',
  degree: 'B.Tech Computer Engineering',
  yearSemester: '3rd Year / 5th Semester',
  subjects: [
    'Data Structures & Algorithms',
    'Database Management Systems',
    'Computer Organization & Architecture',
    'Discrete Mathematics',
    'Python for Computing'
  ],
  syllabus: 'Core Semester 5 curriculum focusing on Advanced Trees, Query Optimization, Memory Hierarchy, Graph Theory, and Scripting.',
  upcomingExams: [
    { subject: 'Computer Networks & Architecture', date: '2026-09-23', daysLeft: 8 },
    { subject: 'Data Structures & Algorithms', date: '2026-09-29', daysLeft: 14 },
    { subject: 'Database Management Systems', date: '2026-10-06', daysLeft: 21 }
  ],
  dailyStudyTime: '2.5 Hours',
  preferredLearningStyle: 'visual',
  studyDifficulties: ['remembering', 'solving-problems', 'revising-before-exams'],
  onboarded: true
};

export const initialSubjects: Subject[] = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    description: 'Fundamental linear & non-linear structures, complexity, tree rotations, graphs, and dynamic programming.',
    progress: 68,
    color: 'indigo',
    accentColor: '#818cf8',
    units: [
      {
        id: 'dsa-u1',
        unitNumber: 1,
        title: 'Linear Data Structures',
        topics: [
          { id: 't-arrays', name: 'Arrays & Dynamic Arrays', unitId: 'dsa-u1', subjectId: 'dsa', status: 'mastered', quizScore: 92, confidenceScore: 95, lastReviewedDaysAgo: 2, difficulty: 'easy', notesCount: 3 },
          { id: 't-linkedlist', name: 'Singly & Doubly Linked Lists', unitId: 'dsa-u1', subjectId: 'dsa', status: 'mastered', quizScore: 81, confidenceScore: 84, lastReviewedDaysAgo: 5, difficulty: 'medium', notesCount: 2 },
          { id: 't-stacks', name: 'Stacks & Expression Evaluation', unitId: 'dsa-u1', subjectId: 'dsa', status: 'mastered', quizScore: 89, confidenceScore: 90, lastReviewedDaysAgo: 4, difficulty: 'easy', notesCount: 2 },
          { id: 't-queues', name: 'Queues & Circular Buffers', unitId: 'dsa-u1', subjectId: 'dsa', status: 'learning', quizScore: 72, confidenceScore: 70, lastReviewedDaysAgo: 7, difficulty: 'medium', notesCount: 1 }
        ]
      },
      {
        id: 'dsa-u2',
        unitNumber: 2,
        title: 'Hierarchical & Tree Structures',
        topics: [
          { id: 't-bst', name: 'Binary Search Trees & Traversal', unitId: 'dsa-u2', subjectId: 'dsa', status: 'needs-revision', quizScore: 65, confidenceScore: 60, lastReviewedDaysAgo: 6, difficulty: 'medium', notesCount: 2 },
          { id: 't-avl', name: 'AVL Trees & Rotations (LL, RR, LR, RL)', unitId: 'dsa-u2', subjectId: 'dsa', status: 'needs-revision', quizScore: 54, confidenceScore: 45, lastReviewedDaysAgo: 3, difficulty: 'hard', notesCount: 2 },
          { id: 't-heaps', name: 'Binary Heaps & Priority Queues', unitId: 'dsa-u2', subjectId: 'dsa', status: 'learning', quizScore: 68, confidenceScore: 62, lastReviewedDaysAgo: 9, difficulty: 'medium', notesCount: 1 }
        ]
      },
      {
        id: 'dsa-u3',
        unitNumber: 3,
        title: 'Graphs & Optimization',
        topics: [
          { id: 't-graph-basics', name: 'Graph Representations (Adj Matrix / List)', unitId: 'dsa-u3', subjectId: 'dsa', status: 'learning', quizScore: 64, confidenceScore: 60, lastReviewedDaysAgo: 8, difficulty: 'medium', notesCount: 1 },
          { id: 't-graph-sp', name: 'Shortest Paths (Dijkstra & Bellman-Ford)', unitId: 'dsa-u3', subjectId: 'dsa', status: 'needs-revision', quizScore: 43, confidenceScore: 38, lastReviewedDaysAgo: 10, difficulty: 'hard', notesCount: 1 }
        ]
      }
    ]
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    code: 'CS302',
    description: 'Relational algebra, SQL query optimization, transactions, ACID properties, and indexing.',
    progress: 74,
    color: 'cyan',
    accentColor: '#22d3ee',
    units: [
      {
        id: 'dbms-u1',
        unitNumber: 1,
        title: 'Relational Foundations & SQL',
        topics: [
          { id: 't-sql-basics', name: 'Basic SQL Queries & Joins', unitId: 'dbms-u1', subjectId: 'dbms', status: 'mastered', quizScore: 89, confidenceScore: 92, lastReviewedDaysAgo: 3, difficulty: 'easy', notesCount: 2 },
          { id: 't-sql-nested', name: 'Correlated Subqueries & Nested Queries', unitId: 'dbms-u1', subjectId: 'dbms', status: 'needs-revision', quizScore: 48, confidenceScore: 40, lastReviewedDaysAgo: 4, difficulty: 'hard', notesCount: 2 }
        ]
      },
      {
        id: 'dbms-u2',
        unitNumber: 2,
        title: 'Normalization & Storage',
        topics: [
          { id: 't-normal-forms', name: '1NF, 2NF, 3NF & BCNF', unitId: 'dbms-u2', subjectId: 'dbms', status: 'learning', quizScore: 71, confidenceScore: 65, lastReviewedDaysAgo: 8, difficulty: 'medium', notesCount: 1 },
          { id: 't-b-trees', name: 'B-Trees & B+ Trees Indexing', unitId: 'dbms-u2', subjectId: 'dbms', status: 'learning', quizScore: 63, confidenceScore: 55, lastReviewedDaysAgo: 11, difficulty: 'hard', notesCount: 1 }
        ]
      },
      {
        id: 'dbms-u3',
        unitNumber: 3,
        title: 'Transactions & Concurrency',
        topics: [
          { id: 't-acid', name: 'ACID Properties & Serializability', unitId: 'dbms-u3', subjectId: 'dbms', status: 'mastered', quizScore: 85, confidenceScore: 88, lastReviewedDaysAgo: 5, difficulty: 'medium', notesCount: 2 },
          { id: 't-locking', name: 'Two-Phase Locking (2PL) & Deadlocks', unitId: 'dbms-u3', subjectId: 'dbms', status: 'learning', quizScore: 66, confidenceScore: 60, lastReviewedDaysAgo: 6, difficulty: 'hard', notesCount: 1 }
        ]
      }
    ]
  },
  {
    id: 'coa',
    name: 'Computer Organization & Architecture',
    code: 'CS303',
    description: 'CPU pipeline hazards, cache mapping algorithms, instruction set architectures, and virtual memory.',
    progress: 58,
    color: 'violet',
    accentColor: '#a78bfa',
    units: [
      {
        id: 'coa-u1',
        unitNumber: 1,
        title: 'Processor & Memory Hierarchy',
        topics: [
          { id: 't-cache', name: 'Direct & Set-Associative Cache Mapping', unitId: 'coa-u1', subjectId: 'coa', status: 'learning', quizScore: 69, confidenceScore: 64, lastReviewedDaysAgo: 6, difficulty: 'medium', notesCount: 1 },
          { id: 't-paging', name: 'Paging, TLB & Virtual Memory', unitId: 'coa-u1', subjectId: 'coa', status: 'needs-revision', quizScore: 52, confidenceScore: 42, lastReviewedDaysAgo: 5, difficulty: 'hard', notesCount: 2 }
        ]
      },
      {
        id: 'coa-u2',
        unitNumber: 2,
        title: 'Instruction Execution & Pipelining',
        topics: [
          { id: 't-pipeline', name: '5-Stage RISC Pipeline & Hazards', unitId: 'coa-u2', subjectId: 'coa', status: 'learning', quizScore: 62, confidenceScore: 58, lastReviewedDaysAgo: 9, difficulty: 'hard', notesCount: 1 },
          { id: 't-interrupts', name: 'I/O Interrupts & DMA Transfers', unitId: 'coa-u2', subjectId: 'coa', status: 'not-started', quizScore: 0, confidenceScore: 20, lastReviewedDaysAgo: 14, difficulty: 'medium', notesCount: 0 }
        ]
      }
    ]
  },
  {
    id: 'dm',
    name: 'Discrete Mathematics',
    code: 'CS304',
    description: 'Propositional logic, recurrence relations, graph colorings, and combinatorial proofs.',
    progress: 82,
    color: 'amber',
    accentColor: '#fbbf24',
    units: [
      {
        id: 'dm-u1',
        unitNumber: 1,
        title: 'Logic & Proofs',
        topics: [
          { id: 't-prop-logic', name: 'Propositional Calculus & Truth Tables', unitId: 'dm-u1', subjectId: 'dm', status: 'mastered', quizScore: 95, confidenceScore: 96, lastReviewedDaysAgo: 3, difficulty: 'easy', notesCount: 2 },
          { id: 't-recurrence', name: 'Solving Recurrence Relations (Master Theorem)', unitId: 'dm-u1', subjectId: 'dm', status: 'mastered', quizScore: 84, confidenceScore: 85, lastReviewedDaysAgo: 4, difficulty: 'medium', notesCount: 2 }
        ]
      }
    ]
  },
  {
    id: 'python',
    name: 'Python for Computing',
    code: 'CS305',
    description: 'List comprehensions, OOP principles, generator patterns, NumPy vectorization.',
    progress: 90,
    color: 'emerald',
    accentColor: '#34d399',
    units: [
      {
        id: 'py-u1',
        unitNumber: 1,
        title: 'Python Core & Advanced Patterns',
        topics: [
          { id: 't-py-basics', name: 'Python Fundamentals & Dictionaries', unitId: 'py-u1', subjectId: 'py-u1', status: 'mastered', quizScore: 94, confidenceScore: 96, lastReviewedDaysAgo: 2, difficulty: 'easy', notesCount: 1 },
          { id: 't-py-generators', name: 'Generators, Decorators & Closures', unitId: 'py-u1', subjectId: 'py-u1', status: 'mastered', quizScore: 88, confidenceScore: 90, lastReviewedDaysAgo: 5, difficulty: 'medium', notesCount: 2 }
        ]
      }
    ]
  }
];

export const initialStudyPlan: StudyPlanItem[] = [
  {
    id: 'sp-1',
    time: '09:00',
    title: 'Review Linked Lists & Pointer Shifts',
    durationMinutes: 20,
    type: 'review',
    topic: 'Singly & Doubly Linked Lists',
    subject: 'Data Structures & Algorithms',
    completed: true
  },
  {
    id: 'sp-2',
    time: '10:00',
    title: 'Practice Binary Search Trees & AVL Rotations',
    durationMinutes: 35,
    type: 'practice',
    topic: 'AVL Trees & Rotations (LL, RR, LR, RL)',
    subject: 'Data Structures & Algorithms',
    completed: false
  },
  {
    id: 'sp-3',
    time: '16:00',
    title: 'Quick Active Recall Quiz on Paging & TLB',
    durationMinutes: 15,
    type: 'quiz',
    topic: 'Paging, TLB & Virtual Memory',
    subject: 'Computer Organization & Architecture',
    completed: false
  },
  {
    id: 'sp-4',
    time: '20:00',
    title: 'Revise Weak Concept: Correlated Subqueries',
    durationMinutes: 20,
    type: 'concept',
    topic: 'Correlated Subqueries & Nested Queries',
    subject: 'Database Management Systems',
    completed: false
  }
];

export const initialNotes: NoteItem[] = [
  {
    id: 'note-1',
    title: 'AVL Tree Rotations — Visual Cheat Sheet',
    subject: 'Data Structures & Algorithms',
    topic: 'AVL Trees & Rotations',
    type: 'cheatsheet',
    noteType: 'cheatsheet',
    length: 'quick',
    summary: 'Compact summary of balance factors, RR/LL/LR/RL rotations, and time complexities.',
    content: `# AVL Tree Balancing Cheat Sheet

### Balance Factor Formula:
\`\`\`
Balance Factor (BF) = Height(Left Subtree) - Height(Right Subtree)
Allowed range: {-1, 0, +1}
\`\`\`

### The 4 Rotations:
1. **Left-Left (LL) Case**: Node inserted into left subtree of left child (BF = +2).
   - *Fix*: Single **Right Rotation** at grandparent.
2. **Right-Right (RR) Case**: Node inserted into right subtree of right child (BF = -2).
   - *Fix*: Single **Left Rotation** at grandparent.
3. **Left-Right (LR) Case**: Node inserted into right subtree of left child.
   - *Fix*: Double rotation — Left rotate child, then Right rotate grandparent.
4. **Right-Left (RL) Case**: Node inserted into left subtree of right child.
   - *Fix*: Double rotation — Right rotate child, then Left rotate grandparent.

### Time Complexity:
- Search: O(log n)
- Insert: O(log n) (at most 2 rotations)
- Delete: O(log n) (may require O(log n) rotations up the tree)`,
    createdAt: '2 days ago',
    tags: ['DSA', 'Trees', 'Rotations', 'Exam High-Yield']
  },
  {
    id: 'note-2',
    title: 'Paging vs Segmentation in 5 Minutes',
    subject: 'Computer Organization & Architecture',
    topic: 'Paging, TLB & Virtual Memory',
    type: 'quick-revision',
    noteType: 'quick',
    length: 'quick',
    summary: 'Key distinctions between paging and segmentation, internal vs external fragmentation, and TLB access time.',
    content: `# Virtual Memory Architecture: Paging vs Segmentation

### Paging:
- **Block Size**: Fixed size (typically 4 KB pages and page frames).
- **Programmer View**: Invisible to the programmer; hardware/OS level abstraction.
- **Fragmentation**: Suffers from **Internal Fragmentation** (last page may not be full), zero external fragmentation.
- **Address Translation**: Logical address = (Page Number 'p', Offset 'd').

### Segmentation:
- **Block Size**: Variable size based on program modules (Code segment, Data segment, Stack).
- **Programmer View**: Visible; matches high-level program structure.
- **Fragmentation**: Suffers from **External Fragmentation** (variable sized gaps in memory).

### TLB (Translation Lookaside Buffer):
- Hardware associative cache that stores recently used (VPN -> PFN) mappings.
- **Effective Access Time (EAT)**: EAT = Hit_Ratio * (TLB_time + Memory_time) + (1 - Hit_Ratio) * (TLB_time + 2 * Memory_time).`,
    createdAt: '3 days ago',
    tags: ['COA', 'OS', 'Virtual Memory', 'Formula']
  },
  {
    id: 'note-3',
    title: 'SQL Subqueries: Correlated vs Non-Correlated',
    subject: 'Database Management Systems',
    topic: 'Correlated Subqueries & Nested Queries',
    type: 'definitions',
    noteType: 'definitions',
    length: 'detailed',
    summary: 'Differences between independent subqueries and correlated row-by-row subqueries with worked examples.',
    content: `# SQL Subquery Deep Dive

### 1. Non-Correlated Subquery:
The inner query executes **once** independently of the outer query.
\`\`\`sql
SELECT name, salary 
FROM employees 
WHERE salary > (SELECT AVG(salary) FROM employees);
\`\`\`

### 2. Correlated Subquery:
The inner query references a column from the outer query table, executing **once for every candidate row** of the outer query.
\`\`\`sql
SELECT e1.name, e1.department, e1.salary
FROM employees e1
WHERE e1.salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    WHERE e2.department = e1.department
);
\`\`\`
*Common Mistake*: Overusing correlated subqueries when an \`INNER JOIN\` with an aggregated subquery or a \`WINDOW FUNCTION\` (\`AVG(salary) OVER(PARTITION BY department)\`) is dramatically faster!`,
    createdAt: '5 days ago',
    tags: ['DBMS', 'SQL', 'Subqueries', 'Optimization']
  }
];

export const initialMindMap: MindMapNode = {
  id: 'root-os',
  label: 'Operating System Architecture',
  description: 'The core resource orchestrator bridging user applications and hardware execution.',
  color: '#818cf8',
  children: [
    {
      id: 'mm-process',
      label: 'Process Management',
      description: 'Management of running programs, CPU scheduling, and context state switches.',
      color: '#38bdf8',
      keyPoints: ['Process States (New, Ready, Running, Waiting, Terminated)', 'PCB (Process Control Block) carries registers & PID', 'CPU Scheduling (FCFS, Round Robin, SJF, Priority)'],
      relatedConcepts: ['Threads & Concurrency', 'Context Switching Overhead', 'Deadlock Detection'],
      children: [
        {
          id: 'mm-proc-states',
          label: 'Process States & Transitions',
          description: '5-state lifecycle model from creation to cleanup.',
          keyPoints: ['Ready -> Running via Dispatcher', 'Running -> Waiting via I/O block', 'Preemption moves Running -> Ready']
        },
        {
          id: 'mm-sched',
          label: 'CPU Scheduling Algorithms',
          description: 'Maximizing CPU utilization and minimizing response latency.',
          keyPoints: ['Preemptive vs Non-Preemptive', 'Round Robin uses Time Quantum', 'Multilevel Feedback Queues']
        },
        {
          id: 'mm-sync',
          label: 'Synchronization & Semaphores',
          description: 'Guarding critical sections to prevent race conditions.',
          keyPoints: ['Mutex (Binary)', 'Counting Semaphore', "Peterson's Solution", 'Dining Philosophers Problem']
        }
      ]
    },
    {
      id: 'mm-memory',
      label: 'Memory Management',
      description: 'Allocation of RAM, logical-to-physical address translation, and virtual memory isolation.',
      color: '#a78bfa',
      keyPoints: ['MMU hardware address translation', 'Paging prevents external fragmentation', 'Demand Paging swap space'],
      relatedConcepts: ['TLB Misses', 'Page Replacement (LRU, FIFO, Clock)', 'Thrashing'],
      children: [
        {
          id: 'mm-paging',
          label: 'Paging & TLB',
          description: 'Fixed-size memory mapping mechanism.',
          keyPoints: ['Virtual Address = Page # + Offset', 'Multi-level page tables conserve RAM']
        },
        {
          id: 'mm-replacement',
          label: 'Page Faults & Replacement',
          description: 'Handling page misses when RAM frames are exhausted.',
          keyPoints: ['Belady’s Anomaly in FIFO', 'Optimal Page Replacement (OPT)', 'Least Recently Used (LRU)']
        }
      ]
    },
    {
      id: 'mm-storage',
      label: 'File & I/O Systems',
      description: 'Persistent secondary storage organization and directory indexing structures.',
      color: '#34d399',
      keyPoints: ['Inodes store file metadata & pointer blocks', 'Disk scheduling (SCAN, C-LOOK, SSTF)', 'Journaling for crash recovery'],
      children: [
        {
          id: 'mm-file-sys',
          label: 'File Allocation Methods',
          description: 'Contiguous, Linked, and Indexed block allocation schemes.',
          keyPoints: ['Inodes support direct, single, double, and triple indirect blocks']
        },
        {
          id: 'mm-disk-sched',
          label: 'Disk Scheduling Algorithms',
          description: 'Optimizing seek head mechanical movement.',
          keyPoints: ['SCAN acts like an elevator', 'C-LOOK only scans towards the end with requests']
        }
      ]
    }
  ]
};

export const initialMemoryShortcuts: MemoryShortcutItem[] = [
  {
    id: 'sc-1',
    subject: 'Computer Networks',
    topic: 'OSI 7 Layers',
    title: 'OSI Layer Hierarchy (Physical to Application)',
    mnemonic: 'Please Do Not Throw Sausage Pizza Away',
    story: 'Imagine an Italian chef preparing a royal feast who gently tells his kitchen crew: "Please Do Not Throw Sausage Pizza Away!"',
    visualAssociation: 'A 7-story Italian pizza tower where the ground floor is Physical wiring, and the penthouse roof is the Application browser.',
    whyItWorks: 'Uses strong sensory imagery (warm sausage pizza) paired with the exact first letters: Physical (P), Data Link (D), Network (N), Transport (T), Session (S), Presentation (P), Application (A).',
    tags: ['Networking', 'OSI', 'High-Yield Mnemonic'],
    createdAt: '3 days ago'
  },
  {
    id: 'sc-2',
    subject: 'Database Management Systems',
    topic: 'ACID Properties',
    title: 'ACID Transaction Guarantees',
    mnemonic: 'All Cars In Drive',
    story: 'Four heavy armored trucks traveling in tight convoy: Atomicity (all or nothing), Consistency (valid state), Isolation (no collision), Durability (written to stone).',
    visualAssociation: 'Four sturdy gears locked together inside an indestructible armored safe.',
    whyItWorks: 'Relates an abstract safety contract to four tangible mechanical rules that ensure zero data corruption during power cuts.',
    tags: ['DBMS', 'Transactions', 'ACID'],
    createdAt: '5 days ago'
  },
  {
    id: 'sc-3',
    subject: 'Data Structures & Algorithms',
    topic: 'AVL Rotations',
    title: 'AVL Left-Right / Right-Left Balancing Rule',
    mnemonic: 'Straighten then Swing',
    story: 'When a tree has an "elbow" crook (Left-Right or Right-Left), you cannot swing the branch yet! First, straighten the crooked arm into a straight line, then swing it like a pendulum.',
    visualAssociation: 'A martial artist first extending a bent elbow into a straight arm, then rotating at the shoulder into perfect balance.',
    whyItWorks: 'Solves the most common student error in AVL trees: attempting a single rotation on an LR/RL imbalance instead of first converting it to an LL/RR form.',
    tags: ['DSA', 'AVL Trees', 'Rotations', 'Concept Shortcut'],
    createdAt: '1 week ago'
  }
];

export const initialRevisionRadar: RevisionRadarItem[] = [
  {
    id: 'rad-1',
    topic: 'Binary Search Trees & Traversal',
    subject: 'Data Structures & Algorithms',
    lastReviewedDaysAgo: 6,
    retentionEstimate: 42,
    status: 'due-now',
    urgency: 'high',
    reason: 'You learned this 6 days ago and haven’t practiced it since. Forgetting curve threshold reached.',
    recommendedAction: 'Take a 5-minute Active Recall test on Inorder successor edge cases.'
  },
  {
    id: 'rad-2',
    topic: 'AVL Trees & Rotations (LL, RR, LR, RL)',
    subject: 'Data Structures & Algorithms',
    lastReviewedDaysAgo: 3,
    retentionEstimate: 54,
    status: 'due-now',
    urgency: 'high',
    reason: 'Recent quiz accuracy dropped to 54%. Reviewing rotations now will cement pattern recognition.',
    recommendedAction: 'Inspect the interactive visual mind map and solve 3 balance factor exercises.'
  },
  {
    id: 'rad-3',
    topic: 'Paging, TLB & Virtual Memory',
    subject: 'Computer Organization & Architecture',
    lastReviewedDaysAgo: 5,
    retentionEstimate: 58,
    status: 'due-soon',
    urgency: 'medium',
    reason: 'Exam in 8 days. Effective Access Time (EAT) formulas need reinforcement.',
    recommendedAction: 'Quick 10-minute formula review with the Notes Studio cheat sheet.'
  },
  {
    id: 'rad-4',
    topic: 'Correlated Subqueries & Nested Queries',
    subject: 'Database Management Systems',
    lastReviewedDaysAgo: 4,
    retentionEstimate: 62,
    status: 'due-soon',
    urgency: 'medium',
    reason: 'Weak area flagged from last week’s practice session. Accuracy currently at 48%.',
    recommendedAction: 'Practice converting 2 correlated queries into JOIN equivalents.'
  },
  {
    id: 'rad-5',
    topic: 'Arrays & Dynamic Arrays',
    subject: 'Data Structures & Algorithms',
    lastReviewedDaysAgo: 2,
    retentionEstimate: 92,
    status: 'recently-reviewed',
    urgency: 'low',
    reason: 'Mastery confirmed at 92%. Solid retention on dynamic amortized O(1) resizing.',
    recommendedAction: 'Next review scheduled in 12 days.'
  }
];

export const initialExamPlan: ExamCountdown = {
  id: 'exam-networks-coa',
  subject: 'Computer Networks & Architecture',
  examDate: '2026-09-23',
  daysLeft: 8,
  confidence: 62,
  priorityTopics: [
    { topic: 'TCP/IP Protocol Suite & Handshakes', priority: 'High', weightage: '28% of Marks', confidence: 55 },
    { topic: 'Routing Algorithms (Dijkstra, Distance Vector)', priority: 'High', weightage: '24% of Marks', confidence: 48 },
    { topic: 'Paging, TLB & Memory Hierarchy', priority: 'High', weightage: '20% of Marks', confidence: 52 },
    { topic: 'Application Layer (DNS, HTTP/2, SMTP)', priority: 'Medium', weightage: '16% of Marks', confidence: 75 },
    { topic: 'Network Security & Encryption Basics', priority: 'Low', weightage: '12% of Marks', confidence: 82 }
  ],
  revisionSchedule: [
    { dayNumber: 1, dateStr: 'Today', tasks: ['Master TCP 3-Way Handshake & SYN Floods', 'Practice 2 TLB Effective Access Time problems', 'Recall Quiz: 10 Qs'] },
    { dayNumber: 2, dateStr: 'Tomorrow', tasks: ['Distance Vector vs Link State Routing drill', 'Review subnetting (CIDR notation)', 'Create 1-page cheat sheet'] },
    { dayNumber: 3, dateStr: 'In 2 Days', tasks: ['Cache mapping (Direct vs 4-way associative)', 'Solve 3 previous year exam questions', 'Memory shortcut review'] },
    { dayNumber: 4, dateStr: 'In 3 Days', tasks: ['Full Unit 1 & 2 timed mock quiz (30 mins)', 'Analyze weak answers with NOVA AI', 'Remediation review'] },
    { dayNumber: 5, dateStr: 'In 4 Days', tasks: ['DNS hierarchy & recursive lookup flows', 'HTTP status codes & caching headers', 'Active recall session'] },
    { dayNumber: 6, dateStr: 'In 5 Days', tasks: ['Comprehensive Mock Exam 1 (60 minutes)', 'Weak topic targeted flash drills'] },
    { dayNumber: 7, dateStr: 'In 6 Days', tasks: ['High-yield formula & definition speed run', 'Formula sheet download & mental walkthrough'] },
    { dayNumber: 8, dateStr: 'Exam Eve', tasks: ['Light 45-min confidence review', 'Zero panic revision', 'Sleep 8 hours'] }
  ],
  dailyTargets: [
    'Complete TCP Handshake active recall test',
    'Solve 2 CIDR prefix masking calculations',
    'Review 1 page cheat sheet for memory hierarchy'
  ]
};
