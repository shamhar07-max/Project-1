import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [tools, setTools] = useState([]);
  const [loop, setLoop] = useState([]);
  const [stageHelp, setStageHelp] = useState({});
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);
  const [records, setRecords] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([api.courses(), api.tools(), api.loop(), api.capabilityLevels()]).then(
      ([c, t, l, lv]) => {
        setCourses(c.courses);
        setTools(t.tools);
        setLoop(l.loop);
        setStageHelp(l.help);
        setLevels(lv.levels);
        setReady(true);
      }
    );
  }, []);

  const refreshProgress = useCallback(async () => {
    if (!user) return;
    const data = await api.progress();
    setProgress(data.progress);
  }, [user]);

  const refreshRecords = useCallback(async () => {
    if (!user) return;
    const data = await api.records();
    setRecords(data.records);
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshProgress();
      refreshRecords();
    } else {
      setProgress([]);
      setRecords([]);
    }
  }, [user, refreshProgress, refreshRecords]);

  const courseByCode = useCallback((code) => courses.find((c) => c.code === code) || null, [courses]);
  const progressFor = useCallback((code) => progress.find((p) => p.code === code) || null, [progress]);

  const value = {
    courses,
    tools,
    loop,
    stageHelp,
    levels,
    progress,
    records,
    ready,
    courseByCode,
    progressFor,
    refreshProgress,
    refreshRecords,
    refreshAll: async () => {
      await Promise.all([refreshProgress(), refreshRecords()]);
    }
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
