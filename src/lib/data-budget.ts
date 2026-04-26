'use client';

const todayKey = (): string => {
  const d = new Date();
  return `vimore_data_budget_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const monthKey = (): string => {
  const d = new Date();
  return `vimore_data_budget_month_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

let started = false;
let pendingFlush: ReturnType<typeof setTimeout> | null = null;
let inMemoryToday = 0;
let inMemoryMonth = 0;

const flush = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(todayKey(), String(Math.floor(inMemoryToday)));
    localStorage.setItem(monthKey(), String(Math.floor(inMemoryMonth)));
    window.dispatchEvent(new CustomEvent('vimore_data_budget_update'));
  } catch { /* ignore quota */ }
};

const scheduleFlush = () => {
  if (pendingFlush) return;
  pendingFlush = setTimeout(() => {
    pendingFlush = null;
    flush();
  }, 1500);
};

export function startDataBudgetTracker() {
  if (started || typeof window === 'undefined') return;
  if (typeof PerformanceObserver === 'undefined') return;
  started = true;

  try {
    inMemoryToday = Number(localStorage.getItem(todayKey()) || '0') || 0;
    inMemoryMonth = Number(localStorage.getItem(monthKey()) || '0') || 0;
  } catch { /* ignore */ }

  const handle = (entries: PerformanceResourceTiming[]) => {
    for (const entry of entries) {
      const size = (entry as any).transferSize || (entry as any).encodedBodySize || 0;
      if (size > 0) {
        inMemoryToday += size;
        inMemoryMonth += size;
      }
    }
    scheduleFlush();
  };

  try {
    const obs = new PerformanceObserver((list) => {
      handle(list.getEntries() as PerformanceResourceTiming[]);
    });
    obs.observe({ type: 'resource', buffered: true });
  } catch { /* ignore unsupported */ }
}

export function getTodayBytes(): number {
  if (typeof window === 'undefined') return 0;
  try { return Number(localStorage.getItem(todayKey()) || '0') || 0; } catch { return 0; }
}

export function getMonthBytes(): number {
  if (typeof window === 'undefined') return 0;
  try { return Number(localStorage.getItem(monthKey()) || '0') || 0; } catch { return 0; }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const CAP_KEY = 'vimore_monthly_cap_mb';

export function getMonthlyCapMB(): number {
  if (typeof window === 'undefined') return 0;
  try { return Number(localStorage.getItem(CAP_KEY) || '0') || 0; } catch { return 0; }
}

export function setMonthlyCapMB(mb: number) {
  if (typeof window === 'undefined') return;
  try {
    if (mb > 0) localStorage.setItem(CAP_KEY, String(mb));
    else localStorage.removeItem(CAP_KEY);
    window.dispatchEvent(new CustomEvent('vimore_data_budget_update'));
  } catch { /* ignore */ }
}

export function isOverBudget(): boolean {
  const capMB = getMonthlyCapMB();
  if (capMB <= 0) return false;
  return getMonthBytes() > capMB * 1024 * 1024;
}
