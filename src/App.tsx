/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavRoute } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AITutorView } from './components/AITutorView';
import { NotesStudioView } from './components/NotesStudioView';
import { MindMapView } from './components/MindMapView';
import { MemoryLabView } from './components/MemoryLabView';
import { RecallModeView } from './components/RecallModeView';
import { SmartQuizView } from './components/SmartQuizView';
import { ExamModeView } from './components/ExamModeView';
import { RevisionRadarView } from './components/RevisionRadarView';
import { SubjectWorkspaceView } from './components/SubjectWorkspaceView';
import { AnalyticsView } from './components/AnalyticsView';
import { VaultView } from './components/VaultView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { OnboardingModal } from './components/OnboardingModal';
import { CommandBarModal } from './components/CommandBarModal';
import { FocusRoomModal } from './components/FocusRoomModal';

function MainLayout() {
  const {
    profile,
    isFocusModeOpen,
    setIsFocusModeOpen,
    isCommandBarOpen,
    setIsCommandBarOpen
  } = useStudy();

  const [currentRoute, setCurrentRoute] = useState<NavRoute>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!profile.onboarded);

  // Pre-fill state passed across views (e.g. from Dashboard or Radar to Tutor or Quiz)
  const [prefillData, setPrefillData] = useState<{ topic?: string; subject?: string }>({
    topic: 'AVL Tree Rotations',
    subject: 'Data Structures & Algorithms'
  });

  const handleNavigate = (route: NavRoute, prefill?: { topic?: string; subject?: string }) => {
    if (prefill) {
      setPrefillData(prefill);
    }
    setCurrentRoute(route);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsMobileMenuOpen(prev => !prev)}
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
        onOpenFocusMode={() => setIsFocusModeOpen(true)}
        onOpenProfile={() => setCurrentRoute('profile')}
      />

      <div className="flex-1 flex">
        {/* Navigation Sidebar */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Main Workspace Canvas */}
        <main
          className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full ${
            isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'
          }`}
        >
          {currentRoute === 'home' && (
            <DashboardView
              onNavigate={handleNavigate}
              onOpenFocusMode={() => setIsFocusModeOpen(true)}
            />
          )}

          {currentRoute === 'tutor' && (
            <AITutorView
              initialTopic={prefillData.topic}
              initialSubject={prefillData.subject}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === 'notes' && (
            <NotesStudioView
              initialTopic={prefillData.topic}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === 'mindmaps' && (
            <MindMapView
              initialTopic={prefillData.topic}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === 'memory-lab' && (
            <MemoryLabView
              initialTopic={prefillData.topic}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === 'recall' && (
            <RecallModeView
              initialTopic={prefillData.topic}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === 'quiz' && (
            <SmartQuizView
              initialTopic={prefillData.topic}
              initialSubject={prefillData.subject}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === 'exam-mode' && (
            <ExamModeView onNavigate={handleNavigate} />
          )}

          {currentRoute === 'revision-radar' && (
            <RevisionRadarView onNavigate={handleNavigate} />
          )}

          {currentRoute === 'subjects' && (
            <SubjectWorkspaceView
              initialSubject={prefillData.subject}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === 'analytics' && (
            <AnalyticsView onNavigate={handleNavigate} />
          )}

          {currentRoute === 'vault' && (
            <VaultView onNavigate={handleNavigate} />
          )}

          {(currentRoute === 'profile' || currentRoute === 'settings') && (
            <ProfileSettingsView onOpenOnboarding={() => setIsOnboardingOpen(true)} />
          )}
        </main>
      </div>

      {/* Global AI Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <CommandBarModal
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onNavigate={handleNavigate}
      />

      <FocusRoomModal
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <MainLayout />
    </StudyProvider>
  );
}
