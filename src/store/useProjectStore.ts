import { useState } from 'react';
import type { ProjectPlan, Milestone, ChatMessage, AttemptResult } from '../types';
import { generatePlansFromIdea } from '../services/planGenerator';

const defaultPlans = generatePlansFromIdea('Interactive Habit Tracker with Streaks');

export function useProjectStore() {
  const [plans, setPlans] = useState<ProjectPlan[]>(defaultPlans);
  const [activePlan, setActivePlan] = useState<ProjectPlan>(defaultPlans[1]);
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState<number>(0);
  const [activeFileId, setActiveFileId] = useState<string>('/src/App.tsx');
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    '/src/App.tsx': activePlan.fileStructure[0]?.children?.[0]?.content || '',
    '/src/types.ts': activePlan.fileStructure[0]?.children?.[1]?.content || '',
    '/src/HabitList.tsx': activePlan.fileStructure[0]?.children?.[2]?.content || '',
    '/src/useStorage.ts': activePlan.fileStructure[0]?.children?.[3]?.content || '',
    '/src/StatsSummary.tsx': activePlan.fileStructure[0]?.children?.[4]?.content || ''
  });
  const [terminalOutput, setTerminalOutput] = useState<string>('Console ready. Write your code and hit "Run Checkpoint Tests".\n');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c1',
      sender: 'coach',
      text: "Welcome! I'm your AI Coach. I'm here to explain concepts, guide your implementation, and debug errors. Note: I will never write your checkpoint code for you — you'll master every line yourself!",
      timestamp: 'Just now'
    }
  ]);
  const [attempts, setAttempts] = useState<AttemptResult[]>([]);
  const [unlockedFiles, setUnlockedFiles] = useState<string[]>(['/src/App.tsx', '/src/types.ts']);

  const handleGeneratePlans = (idea: string) => {
    const newPlans = generatePlansFromIdea(idea);
    setPlans(newPlans);
    setActivePlan(newPlans[1]);
    setActiveCheckpointIndex(0);
  };

  const handleSelectPlan = (plan: ProjectPlan) => {
    setActivePlan(plan);
    setActiveCheckpointIndex(0);
    const initialFile = plan.fileStructure[0]?.children?.[0]?.path || '/src/App.tsx';
    setActiveFileId(initialFile);
    
    if (plan.milestones[0]) {
      setUnlockedFiles(plan.milestones[0].filesUnlocked);
    }
  };

  const handleCodeChange = (filePath: string, newContent: string) => {
    setFileContents(prev => ({
      ...prev,
      [filePath]: newContent
    }));
  };

  const activeMilestone: Milestone | undefined = activePlan.milestones[activeCheckpointIndex];

  const handleRunEvaluation = () => {
    if (!activeMilestone) return;

    const currentCode = fileContents[activeFileId] || '';
    const staticResults = activeMilestone.staticChecks.map(chk => {
      const targetContent = fileContents[chk.targetFile] || currentCode;
      const passed = targetContent.includes(chk.pattern);
      return { ...chk, passed };
    });

    const testResults = activeMilestone.testCases.map(tc => {
      const passed = currentCode.trim().length > 30;
      return { ...tc, passed };
    });

    const allStaticPassed = staticResults.every(s => s.passed);
    const allTestsPassed = testResults.every(t => t.passed);
    const overallPass = allStaticPassed && allTestsPassed;

    const result: AttemptResult = {
      attemptNumber: attempts.length + 1,
      passed: overallPass,
      testResults,
      staticResults,
      llmFeedback: overallPass
        ? `Great job! You implemented "${activeMilestone.name}" accurately.`
        : `Check the requirements for "${activeMilestone.name}". Make sure your code contains the required pattern.`,
      score: overallPass ? 100 : 45,
      timestamp: new Date().toLocaleTimeString()
    };

    setAttempts(prev => [result, ...prev]);

    if (overallPass) {
      setTerminalOutput(prev => prev + `\n[PASS] Checkpoint ${activeMilestone.order} passed successfully!\n`);
      const nextIdx = activeCheckpointIndex + 1;
      if (nextIdx < activePlan.milestones.length) {
        const nextMs = activePlan.milestones[nextIdx];
        setUnlockedFiles(prev => Array.from(new Set([...prev, ...nextMs.filesUnlocked])));
      }
    } else {
      setTerminalOutput(prev => prev + `\n[FAIL] Attempt ${result.attemptNumber} failed static check or code assertions.\n`);
    }

    return result;
  };

  const handleNextCheckpoint = () => {
    if (activeCheckpointIndex < activePlan.milestones.length - 1) {
      const nextIdx = activeCheckpointIndex + 1;
      setActiveCheckpointIndex(nextIdx);
      const nextMs = activePlan.milestones[nextIdx];
      if (nextMs && nextMs.filesUnlocked.length > 0) {
        setUnlockedFiles(prev => Array.from(new Set([...prev, ...nextMs.filesUnlocked])));
        setActiveFileId(nextMs.filesUnlocked[0]);
      }
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    const lower = text.toLowerCase();
    const isSolutionRequest = lower.includes('write the code') || lower.includes('give me the solution') || lower.includes('write this for me') || lower.includes('complete the checkpoint');

    setTimeout(() => {
      let replyText = '';
      let isWarning = false;

      if (isSolutionRequest) {
        isWarning = true;
        replyText = `🛡️ Guardrail Activated: I cannot write the solution code for Checkpoint ${activeMilestone?.order || 1} ("${activeMilestone?.name}"). However, here is a helpful hint: ${activeMilestone?.hints[0] || 'Break down your function step-by-step!'}`;
      } else if (lower.includes('hint') || lower.includes('help')) {
        replyText = `💡 Coach Hint: ${activeMilestone?.hints[0] || 'Check the example snippet in the Teach panel.'}`;
      } else {
        replyText = `To implement ${activeMilestone?.name || 'this step'}, remember to keep your logic modular. Look closely at ${activeFileId} and ensure your exports match what the checkpoint expects!`;
      }

      const coachMsg: ChatMessage = {
        id: 'msg-coach-' + Date.now(),
        sender: 'coach',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGuardrailWarning: isWarning
      };

      setChatMessages(prev => [...prev, coachMsg]);
    }, 600);
  };

  return {
    plans,
    activePlan,
    activeCheckpointIndex,
    activeMilestone,
    activeFileId,
    fileContents,
    terminalOutput,
    chatMessages,
    attempts,
    unlockedFiles,
    setActiveFileId,
    setActiveCheckpointIndex,
    handleGeneratePlans,
    handleSelectPlan,
    handleCodeChange,
    handleRunEvaluation,
    handleNextCheckpoint,
    handleSendMessage
  };
}
