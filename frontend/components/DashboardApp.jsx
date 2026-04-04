import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  History,
  LogOut,
  Menu,
  X,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  FileText,
  Send,
  Loader2,
} from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { apiGet, apiPatch, apiPost } from '../lib/apiClient';

const TIMEZONES = [
  'UTC',
  'Europe/Lisbon',
  'Europe/Madrid',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
];

function platformLabel(p) {
  if (p === 'twitter') return 'X';
  if (p === 'linkedin') return 'in';
  return 'IG';
}

function mergeUtcTimeOntoDate(prevIso, y, m, d) {
  const prev = new Date(prevIso);
  return new Date(
    Date.UTC(y, m - 1, d, prev.getUTCHours(), prev.getUTCMinutes(), 0, 0),
  ).toISOString();
}

export default function DashboardApp({ user, onLogout, router }) {
  const [tab, setTab] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [genPlatform, setGenPlatform] = useState('instagram');
  const [genType, setGenType] = useState('post');
  const [genTopic, setGenTopic] = useState('');
  const [genTone, setGenTone] = useState('professional');
  const [genLength, setGenLength] = useState('medium');
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [genError, setGenError] = useState('');
  const [variations, setVariations] = useState([]);
  const [varLoading, setVarLoading] = useState(false);
  const [refineInstr, setRefineInstr] = useState('');
  const [refineLoading, setRefineLoading] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const [scheduleTz, setScheduleTz] = useState('UTC');
  const [scheduleMsg, setScheduleMsg] = useState('');

  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  const [calMonth, setCalMonth] = useState(() => new Date());
  const [calItems, setCalItems] = useState([]);
  const [calLoading, setCalLoading] = useState(false);
  const [calTz, setCalTz] = useState(() =>
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      : 'UTC',
  );

  useEffect(() => {
    if (!router?.query?.tab) return;
    const t = router.query.tab;
    if (['overview', 'create', 'calendar', 'history'].includes(t)) setTab(t);
  }, [router?.query?.tab]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const s = await apiGet('/api/v1/content/stats');
    const a = await apiGet('/api/v1/content/list?limit=6');
    if (s.ok && s.data) setStats(s.data);
    if (a.ok && Array.isArray(a.data)) setActivity(a.data);
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    const r = await apiGet('/api/v1/content/list?limit=30&full=true');
    if (r.ok && Array.isArray(r.data)) setHistory(r.data);
    setHistLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, loadHistory]);

  const calRange = useMemo(() => {
    const start = startOfWeek(startOfMonth(calMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(calMonth), { weekStartsOn: 1 });
    return { start, end, days: eachDayOfInterval({ start, end }) };
  }, [calMonth]);

  const loadCalendar = useCallback(async () => {
    setCalLoading(true);
    const from = format(startOfMonth(calMonth), 'yyyy-MM-dd');
    const to = format(endOfMonth(calMonth), 'yyyy-MM-dd');
    const r = await apiGet(`/api/v1/content/calendar?from_date=${from}&to_date=${to}`);
    if (r.ok && Array.isArray(r.data)) setCalItems(r.data);
    setCalLoading(false);
  }, [calMonth]);

  useEffect(() => {
    if (tab === 'calendar') loadCalendar();
  }, [tab, loadCalendar]);

  const itemsByDay = useMemo(() => {
    const map = {};
    for (const it of calItems) {
      const d = format(new Date(it.scheduled_for), 'yyyy-MM-dd');
      if (!map[d]) map[d] = [];
      map[d].push(it);
    }
    return map;
  }, [calItems]);

  const goTab = (t) => {
    setTab(t);
    setMobileNavOpen(false);
    if (router?.replace) {
      router.replace({ pathname: '/dashboard', query: { tab: t } }, undefined, { shallow: true });
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenError('');
    setGenLoading(true);
    setVariations([]);
    const r = await apiPost('/api/v1/content/generate', {
      platform: genPlatform,
      content_type: genType,
      topic: genTopic,
      tone: genTone,
      length: genLength,
      emojis: true,
    });
    setGenLoading(false);
    if (!r.ok) {
      setGenError(
        typeof r.data?.detail === 'string'
          ? r.data.detail
          : 'Generation failed',
      );
      return;
    }
    setGenResult(r.data);
    setScheduleAt(
      format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm"),
    );
  };

  const handleVariations = async () => {
    if (!genResult?.content) return;
    setVarLoading(true);
    const r = await apiPost('/api/v1/content/variations', {
      base_content: genResult.content,
      platform: genPlatform,
      num_variations: 3,
    });
    setVarLoading(false);
    if (r.ok && r.data?.variations) setVariations(r.data.variations);
  };

  const handleRefine = async () => {
    if (!genResult?.id || !refineInstr.trim()) return;
    setRefineLoading(true);
    const r = await apiPost('/api/v1/content/refine', {
      content_id: genResult.id,
      instruction: refineInstr,
      platform: genPlatform,
    });
    setRefineLoading(false);
    if (r.ok && r.data?.content) {
      setGenResult((prev) => ({ ...prev, content: r.data.content }));
      setRefineInstr('');
    }
  };

  const handleSchedule = async () => {
    if (!genResult?.id || !scheduleAt) return;
    const iso = new Date(scheduleAt).toISOString();
    const r = await apiPost('/api/v1/content/schedule', {
      content_id: genResult.id,
      schedule_time: iso,
      timezone: scheduleTz,
    });
    if (r.ok) {
      setScheduleMsg('Scheduled successfully.');
      loadStats();
      if (tab === 'calendar') loadCalendar();
    } else {
      setScheduleMsg('Could not schedule.');
    }
  };

  const onDragStart = (e, item) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDropDay = async (e, dayDate) => {
    e.preventDefault();
    let item;
    try {
      item = JSON.parse(e.dataTransfer.getData('application/json'));
    } catch {
      return;
    }
    if (!item?.id || !item?.scheduled_for) return;
    const ymd = format(dayDate, 'yyyy-MM-dd');
    const [y, m, d] = ymd.split('-').map(Number);
    const newIso = mergeUtcTimeOntoDate(item.scheduled_for, y, m, d);
    const r = await apiPatch(`/api/v1/content/${item.id}/schedule`, {
      schedule_time: newIso,
      timezone: calTz,
    });
    if (r.ok) loadCalendar();
  };

  const NavBtn = ({ id, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => goTab(id)}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition ${
        tab === id
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              PA
            </div>
            <div>
              <p className="font-semibold text-slate-900">PostAssistant</p>
              <p className="text-xs text-slate-500">Studio</p>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          <NavBtn id="overview" icon={LayoutDashboard} label="Overview" />
          <NavBtn id="create" icon={Sparkles} label="Create with AI" />
          <NavBtn id="calendar" icon={CalendarDays} label="Schedule" />
          <NavBtn id="history" icon={History} label="History" />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 truncate mb-2">{user?.email}</p>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold">PostAssistant</span>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMobileNavOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl p-4 flex flex-col">
              <div className="flex justify-end mb-4">
                <button type="button" onClick={() => setMobileNavOpen(false)} className="p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-1 flex-1">
                <NavBtn id="overview" icon={LayoutDashboard} label="Overview" />
                <NavBtn id="create" icon={Sparkles} label="Create with AI" />
                <NavBtn id="calendar" icon={CalendarDays} label="Schedule" />
                <NavBtn id="history" icon={History} label="History" />
              </nav>
              <button
                type="button"
                onClick={onLogout}
                className="mt-4 flex items-center gap-2 text-red-600 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-6xl mx-auto w-full">
          {tab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Welcome back, {user?.name || user?.email?.split('@')[0] || 'creator'}
                </h1>
                <p className="text-slate-600 mt-1">
                  Your command center for AI content, scheduling, and momentum.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    label: 'Total in library',
                    value: stats?.total_posts ?? '—',
                    sub: 'All non-deleted',
                    icon: FileText,
                    color: 'bg-violet-50 text-violet-700 border-violet-100',
                  },
                  {
                    label: 'Scheduled',
                    value: stats?.scheduled ?? '—',
                    sub: 'Queued to go live',
                    icon: Clock,
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  },
                  {
                    label: 'Drafts',
                    value: stats?.drafts ?? '—',
                    sub: 'Ready to polish',
                    icon: Sparkles,
                    color: 'bg-amber-50 text-amber-800 border-amber-100',
                  },
                  {
                    label: 'This week',
                    value: stats?.generated_this_week ?? '—',
                    sub: 'New pieces',
                    icon: TrendingUp,
                    color: 'bg-sky-50 text-sky-700 border-sky-100',
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className={`rounded-2xl border p-4 sm:p-5 ${card.color}`}
                  >
                    <card.icon className="w-5 h-5 mb-3 opacity-80" />
                    <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                      {card.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 tabular-nums">
                      {statsLoading ? '…' : card.value}
                    </p>
                    <p className="text-xs mt-1 opacity-70">{card.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Recent activity
                  </h2>
                  <div className="space-y-3">
                    {activity.length === 0 && !statsLoading && (
                      <p className="text-slate-500 text-sm">
                        No content yet — generate your first post in Create.
                      </p>
                    )}
                    {activity.map((row) => (
                      <div
                        key={row.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="text-xs font-bold text-indigo-600 shrink-0 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            {platformLabel(row.platform)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {row.prompt || row.content_type}
                            </p>
                            <p className="text-sm text-slate-500 line-clamp-2">{row.content}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0 sm:text-right">
                          {format(new Date(row.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-5 sm:p-6 shadow-lg">
                  <h2 className="text-lg font-semibold mb-4">Quick actions</h2>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => goTab('create')}
                      className="w-full py-3 px-4 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      New AI content
                    </button>
                    <button
                      type="button"
                      onClick={() => goTab('calendar')}
                      className="w-full py-3 px-4 rounded-xl bg-white/15 font-semibold text-sm hover:bg-white/25 border border-white/30 flex items-center justify-center gap-2"
                    >
                      <CalendarDays className="w-4 h-4" />
                      Open calendar
                    </button>
                    <button
                      type="button"
                      onClick={() => goTab('history')}
                      className="w-full py-3 px-4 rounded-xl bg-white/15 font-semibold text-sm hover:bg-white/25 border border-white/30 flex items-center justify-center gap-2"
                    >
                      <History className="w-4 h-4" />
                      Browse history
                    </button>
                  </div>
                  <p className="text-xs text-indigo-100 mt-6 leading-relaxed">
                    Tip: schedule posts when your audience is most active — drag events on the
                    calendar to reschedule.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'create' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Create with AI</h1>
                <p className="text-slate-600 mt-1">
                  Generate copy, explore variations, refine with instructions, then schedule.
                </p>
              </div>

              <form
                onSubmit={handleGenerate}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                    <select
                      value={genPlatform}
                      onChange={(e) => {
                        setGenPlatform(e.target.value);
                        if (e.target.value === 'twitter') setGenType('post');
                        else if (e.target.value === 'linkedin') setGenType('post');
                        else setGenType('post');
                      }}
                      className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="twitter">X (Twitter)</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
                    <select
                      value={genType}
                      onChange={(e) => setGenType(e.target.value)}
                      className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm"
                    >
                      {genPlatform === 'twitter' && (
                        <>
                          <option value="post">Post</option>
                          <option value="thread">Thread</option>
                        </>
                      )}
                      {genPlatform === 'instagram' && (
                        <>
                          <option value="post">Caption</option>
                          <option value="story">Story</option>
                          <option value="reel">Reel</option>
                        </>
                      )}
                      {genPlatform === 'linkedin' && <option value="post">Post</option>}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                  <input
                    required
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder="e.g. Spring menu launch, hiring announcement…"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
                    <select
                      value={genTone}
                      onChange={(e) => setGenTone(e.target.value)}
                      className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="funny">Funny</option>
                      <option value="inspirational">Inspirational</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Length</label>
                    <select
                      value={genLength}
                      onChange={(e) => setGenLength(e.target.value)}
                      className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                </div>
                {genError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {genError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={genLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate
                </button>
              </form>

              {genResult && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold">Result</h2>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(genResult.content);
                      }}
                      className="text-sm flex items-center gap-1 text-indigo-600 font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-slate-800 bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-80 overflow-y-auto">
                    {genResult.content}
                  </pre>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleVariations}
                      disabled={varLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                      {varLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Variations
                    </button>
                  </div>
                  {variations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Alternatives</p>
                      {variations.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setGenResult((prev) => ({ ...prev, content: v.content }))
                          }
                          className="w-full text-left text-sm p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                        >
                          {v.content.slice(0, 160)}
                          {v.content.length > 160 ? '…' : ''}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-sm font-medium text-slate-700">Refine with instruction</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        value={refineInstr}
                        onChange={(e) => setRefineInstr(e.target.value)}
                        placeholder="e.g. Shorter, add CTA, more emojis…"
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleRefine}
                        disabled={refineLoading || !refineInstr.trim()}
                        className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium disabled:opacity-50"
                      >
                        {refineLoading ? '…' : 'Apply'}
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Schedule
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="datetime-local"
                        value={scheduleAt}
                        onChange={(e) => setScheduleAt(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <select
                        value={scheduleTz}
                        onChange={(e) => setScheduleTz(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleSchedule}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                    >
                      Save to calendar
                    </button>
                    {scheduleMsg && <p className="text-sm text-emerald-700">{scheduleMsg}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
                  <p className="text-slate-600 mt-1">
                    Month view · drag cards to another day to reschedule (UTC time preserved).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Your timezone</label>
                  <select
                    value={calTz}
                    onChange={(e) => setCalTz(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setCalMonth((d) => subMonths(d, 1))}
                    className="p-2 rounded-lg hover:bg-slate-100"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold">{format(calMonth, 'MMMM yyyy')}</h2>
                  <button
                    type="button"
                    onClick={() => setCalMonth((d) => addMonths(d, 1))}
                    className="p-2 rounded-lg hover:bg-slate-100"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                {calLoading && <p className="text-sm text-slate-500">Loading…</p>}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <div key={d} className="py-2">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calRange.days.map((day) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const dayItems = itemsByDay[key] || [];
                    const muted = !isSameMonth(day, calMonth);
                    return (
                      <div
                        key={key}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onDropDay(e, day)}
                        className={`min-h-[100px] sm:min-h-[120px] rounded-xl border p-1.5 text-left transition ${
                          muted ? 'bg-slate-50/80 border-slate-100' : 'bg-white border-slate-200'
                        } ${isSameDay(day, new Date()) ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}
                      >
                        <span
                          className={`text-xs font-semibold block mb-1 ${muted ? 'text-slate-400' : 'text-slate-700'}`}
                        >
                          {format(day, 'd')}
                        </span>
                        <div className="space-y-1">
                          {dayItems.map((it) => (
                            <div
                              key={it.id}
                              draggable
                              onDragStart={(e) => onDragStart(e, it)}
                              className="text-[10px] sm:text-xs px-1.5 py-1 rounded-md bg-indigo-100 text-indigo-900 cursor-grab active:cursor-grabbing line-clamp-3 border border-indigo-200"
                            >
                              <span className="font-semibold">{platformLabel(it.platform)}</span>{' '}
                              {it.preview}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  Drag a post to another day. Celery Beat runs every 5 minutes to process due
                  schedules (see worker).
                </p>
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">History</h1>
                <p className="text-slate-600 mt-1">Full text of recent generated content.</p>
              </div>
              {histLoading && <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />}
              <div className="space-y-4">
                {history.map((row) => (
                  <article
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {platformLabel(row.platform)} {row.platform} · {row.content_type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(row.created_at), 'PPp')}
                      </span>
                    </div>
                    {row.prompt && (
                      <p className="text-xs text-slate-500 mb-2">Topic: {row.prompt}</p>
                    )}
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{row.content}</p>
                    <p className="text-xs text-slate-400 mt-2 capitalize">Status: {row.status}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 px-1 z-20 safe-area-pb">
          {[
            { id: 'overview', Icon: LayoutDashboard, label: 'Home' },
            { id: 'create', Icon: Sparkles, label: 'Create' },
            { id: 'calendar', Icon: CalendarDays, label: 'Calendar' },
            { id: 'history', Icon: History, label: 'History' },
          ].map(({ id, Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => goTab(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium ${
                tab === id ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
