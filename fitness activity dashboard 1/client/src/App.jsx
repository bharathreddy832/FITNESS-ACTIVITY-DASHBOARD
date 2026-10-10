import { useEffect, useMemo, useState } from "react";
import { Activity, Flame, Clock3, Plus, Trash2, Dumbbell, Footprints, Bike, HeartPulse, CalendarDays } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const today = new Date().toISOString().slice(0, 10);
const emptyForm = { type: "Strength", duration: "30", calories: "180", date: today, notes: "" };
const iconFor = (type) => {
  if (type === "Running" || type === "Walking") return Footprints;
  if (type === "Cycling") return Bike;
  if (type === "Yoga") return HeartPulse;
  return Dumbbell;
};
const prettyDate = (value) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function App() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadWorkouts() {
    try {
      setError("");
      const res = await fetch("/api/workouts");
      if (!res.ok) throw new Error("Could not load workouts. Is the backend running?");
      setWorkouts(await res.json());
    } catch (e) { setError(e.message || "Unable to connect to the API."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadWorkouts(); }, []);

  const totals = useMemo(() => workouts.reduce((acc, w) => ({
    count: acc.count + 1, minutes: acc.minutes + Number(w.duration || 0),
    calories: acc.calories + Number(w.calories || 0)
  }), { count: 0, minutes: 0, calories: 0 }), [workouts]);

  const chartData = useMemo(() => {
    const byDate = {};
    workouts.forEach(w => {
      const day = new Date(w.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      byDate[day] = (byDate[day] || 0) + Number(w.duration);
    });
    return Object.entries(byDate).reverse().map(([day, minutes]) => ({ day, minutes }));
  }, [workouts]);

  async function submit(e) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const res = await fetch("/api/workouts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, duration: Number(form.duration), calories: Number(form.calories) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not save workout.");
      setWorkouts(prev => [data, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setForm({ ...emptyForm, date: today });
    } catch (e) { setError(e.message || "Could not save workout."); }
    finally { setSaving(false); }
  }

  async function removeWorkout(id) {
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not delete workout.");
      setWorkouts(prev => prev.filter(w => w._id !== id));
    } catch (e) { setError(e.message || "Could not delete workout."); }
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={22}/></div><span>pulse<span className="brand-light">fit</span></span></div>
      <div className="side-label">WORKSPACE</div>
      <div className="nav-item active"><Activity size={18}/> Dashboard</div>
      <div className="side-note"><div className="mini-orb"><Flame size={19}/></div><strong>Small steps.<br/>Big progress.</strong><p>Consistency is the real superpower.</p></div>
      <div className="sidebar-footer"><span className="status-dot"></span> Your fitness journey</div>
    </aside>

    <section className="main-area">
      <header className="topbar"><div><div className="eyebrow">YOUR PERSONAL FITNESS SPACE</div><h1>Activity dashboard<span className="period">.</span></h1><p className="subtitle">A little better every day. Keep your momentum going.</p></div><div className="date-chip"><CalendarDays size={16}/>{new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</div></header>
      {error && <div className="alert" role="alert">{error}</div>}
      <section className="stats-grid">
        <Stat icon={Activity} label="WORKOUTS LOGGED" value={totals.count} unit="sessions" tone="green" foot="Every session counts"/>
        <Stat icon={Clock3} label="ACTIVE TIME" value={totals.minutes.toLocaleString()} unit="minutes" tone="blue" foot="Time invested in you"/>
        <Stat icon={Flame} label="CALORIES BURNED" value={totals.calories.toLocaleString()} unit="kcal" tone="orange" foot="Energy in action"/>
      </section>

      <section className="content-grid">
        <div className="panel chart-panel">
          <div className="panel-head"><div><div className="eyebrow">YOUR CONSISTENCY</div><h2>Workout duration</h2></div><span className="chart-tag"><span className="status-dot"></span> Minutes / day</span></div>
          {chartData.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="mintFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8ce6bd" stopOpacity={0.35}/><stop offset="95%" stopColor="#8ce6bd" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 6" stroke="#e9eee9" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8b968e", fontSize: 11 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8b968e", fontSize: 11 }}/><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6ece7", boxShadow: "0 8px 24px #183b2412" }} formatter={(v) => [`${v} min`, "Duration"]}/><Area type="monotone" dataKey="minutes" stroke="#2b9667" strokeWidth={3} fill="url(#mintFill)" activeDot={{ r: 5, fill: "#2b9667" }}/></AreaChart></ResponsiveContainer></div> : <div className="empty-chart"><div className="empty-icon"><Activity size={24}/></div><strong>Your progress starts here</strong><p>Add your first workout to see your activity chart.</p></div>}
          <div className="chart-footer"><span><span className="legend-dot"></span> Workout duration</span><span>{chartData.length} active {chartData.length === 1 ? "day" : "days"} recorded</span></div>
        </div>

        <div className="panel form-panel">
          <div className="panel-head"><div><div className="eyebrow">ADD TO YOUR JOURNAL</div><h2>Log a workout</h2></div><div className="plus-bubble"><Plus size={19}/></div></div>
          <form onSubmit={submit}>
            <label>Workout type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Strength</option><option>Running</option><option>Walking</option><option>Cycling</option><option>Yoga</option><option>Swimming</option><option>Other</option></select></label>
            <div className="form-row"><label>Duration (min)<input type="number" min="1" max="1440" required value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}/></label><label>Calories (kcal)<input type="number" min="0" max="100000" required value={form.calories} onChange={e=>setForm({...form,calories:e.target.value})}/></label></div>
            <label>Date<input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label>
            <label>Notes <span className="optional">(optional)</span><textarea rows="2" placeholder="How did it feel?" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
            <button className="submit-btn" type="submit" disabled={saving}>{saving ? "Saving workout..." : <><Plus size={17}/> Save workout</>}</button>
          </form>
          <p className="form-foot"><span className="status-dot"></span> Progress saved to your dashboard</p>
        </div>
      </section>

      <section className="panel history-panel">
        <div className="panel-head history-head"><div><div className="eyebrow">THE WORK YOU PUT IN</div><h2>Recent activity</h2></div><span className="count-pill">{workouts.length} {workouts.length === 1 ? "entry" : "entries"}</span></div>
        {loading ? <div className="empty-history">Loading your activity…</div> : workouts.length === 0 ? <div className="empty-history"><div className="empty-icon"><Dumbbell size={22}/></div><strong>No workouts yet</strong><p>Use the form above to record your first session.</p></div> :
          <div className="workout-list">{workouts.map(w => { const Icon = iconFor(w.type); return <article className="workout-row" key={w._id}><div className="workout-icon"><Icon size={19}/></div><div className="workout-name"><strong>{w.type}</strong><span>{prettyDate(w.date)}{w.notes ? ` · ${w.notes}` : ""}</span></div><div className="workout-metric"><strong>{w.duration} <small>min</small></strong><span><Flame size={13}/> {w.calories} kcal</span></div><button className="delete-btn" aria-label={`Delete ${w.type} workout`} title="Delete workout" onClick={()=>removeWorkout(w._id)}><Trash2 size={16}/></button></article>; })}</div>}
      </section>
      <footer className="footer"><span>pulsefit <span className="period">•</span> Built for steady progress.</span><span>MOVE WITH PURPOSE</span></footer>
    </section>
  </main>;
}

function Stat({ icon: Icon, label, value, unit, tone, foot }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}<span>{unit}</span></div><div className="stat-foot"><span className="status-dot"></span>{foot}</div></article>;
}