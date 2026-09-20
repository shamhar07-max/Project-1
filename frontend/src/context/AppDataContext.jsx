import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [bundleCatalogue, setBundleCatalogue] = useState([]);
  const [tools, setTools] = useState([]);
  const [loop, setLoop] = useState([]);
  const [stageHelp, setStageHelp] = useState({});
  const [levels, setLevels] = useState([]);
  const [phases, setPhases] = useState([]);
  const [labs, setLabs] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [progress, setProgress] = useState([]);
  const [records, setRecords] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [diagnostic, setDiagnostic] = useState({ passed: false, record: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([api.courses(), api.bundles(), api.tools(), api.loop(), api.capabilityLevels(), api.phases(), api.audiences()]).then(
      ([c, b, t, l, lv, ph, aud]) => {
        setCourses(c.courses);
        setBundleCatalogue(b.bundles);
        setTools(t.tools);
        setLoop(l.loop);
        setStageHelp(l.help);
        setLevels(lv.levels);
        setPhases(ph.phases);
        setLabs(ph.labs);
        setAudiences(aud.audiences);
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

  const refreshBundles = useCallback(async () => {
    if (!user) return;
    const data = await api.bundleStatus();
    setBundles(data.bundles);
  }, [user]);

  const refreshDiagnostic = useCallback(async () => {
    if (!user) return;
    const data = await api.diagnosticStatus();
    setDiagnostic(data);
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshProgress();
      refreshRecords();
      refreshBundles();
      refreshDiagnostic();
    } else {
      setProgress([]);
      setRecords([]);
      setBundles([]);
      setDiagnostic({ passed: false, record: null });
    }
  }, [user, refreshProgress, refreshRecords, refreshBundles, refreshDiagnostic]);

  const courseByCode = useCallback((code) => courses.find((c) => c.code === code) || null, [courses]);
  const progressFor = useCallback((code) => progress.find((p) => p.code === code) || null, [progress]);

  const value = {
    courses,
    bundleCatalogue,
    tools,
    loop,
    stageHelp,
    levels,
    phases,
    labs,
    audiences,
    progress,
    records,
    bundles,
    diagnostic,
    ready,
    courseByCode,
    progressFor,
    refreshProgress,
    refreshRecords,
    refreshBundles,
    refreshDiagnostic,
    refreshAll: async () => {
      await Promise.all([refreshProgress(), refreshRecords(), refreshBundles()]);
    }
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
