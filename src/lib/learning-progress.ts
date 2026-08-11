import { useCallback, useEffect, useMemo, useState } from "react";

export type TopicStar = "read" | "practice" | "comic";

export type LearningProgress = {
  topics: Record<string, TopicStar[]>;
  quizzes: Record<string, { score: number; total: number; completedAt: string }>;
};

const STORAGE_KEY = "maticomics.learningProgress.v1";
const emptyProgress: LearningProgress = { topics: {}, quizzes: {} };

function normalize(progress: Partial<LearningProgress> | null | undefined): LearningProgress {
  return {
    topics: progress?.topics ?? {},
    quizzes: progress?.quizzes ?? {},
  };
}

export function readLearningProgress(): LearningProgress {
  if (typeof window === "undefined") return emptyProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress;
    return normalize(JSON.parse(raw));
  } catch {
    return emptyProgress;
  }
}

export function writeLearningProgress(progress: LearningProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent("maticomics-progress", { detail: progress }));
}

export function getTopicStars(progress: LearningProgress, topicId: string): TopicStar[] {
  return progress.topics[topicId] ?? [];
}

export function getTopicStarCount(progress: LearningProgress, topicId: string): number {
  return getTopicStars(progress, topicId).length;
}

export function isTopicDone(progress: LearningProgress, topicId: string): boolean {
  return getTopicStarCount(progress, topicId) >= 3;
}

export function useLearningProgress() {
  const [progress, setProgressState] = useState<LearningProgress>(emptyProgress);

  useEffect(() => {
    setProgressState(readLearningProgress());
    const handle = () => setProgressState(readLearningProgress());
    window.addEventListener("storage", handle);
    window.addEventListener("maticomics-progress", handle as EventListener);
    return () => {
      window.removeEventListener("storage", handle);
      window.removeEventListener("maticomics-progress", handle as EventListener);
    };
  }, []);

  const setProgress = useCallback((next: LearningProgress) => {
    setProgressState(next);
    writeLearningProgress(next);
  }, []);

  const awardTopicStar = useCallback((topicId: string, star: TopicStar) => {
    const current = readLearningProgress();
    const stars = current.topics[topicId] ?? [];
    if (stars.includes(star)) return;
    setProgress({
      ...current,
      topics: { ...current.topics, [topicId]: [...stars, star] },
    });
  }, [setProgress]);

  const saveQuizScore = useCallback((category: string, score: number, total: number) => {
    const current = readLearningProgress();
    setProgress({
      ...current,
      quizzes: {
        ...current.quizzes,
        [category]: { score, total, completedAt: new Date().toISOString() },
      },
    });
  }, [setProgress]);

  const resetProgress = useCallback(() => {
    setProgress(emptyProgress);
  }, [setProgress]);

  return useMemo(() => ({ progress, awardTopicStar, saveQuizScore, resetProgress }), [progress, awardTopicStar, saveQuizScore, resetProgress]);
}
