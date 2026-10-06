import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, CreditCard, ShieldAlert, UserRound, Volume2, VolumeX, X } from 'lucide-react';
import { AuthUser } from '../../types';
import { readNotifications, TakaSafeNotification, updateNotifications } from '../../services/notifications';

const relativeTime = (value: string) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
};

export const NotificationBell: React.FC<{ user: AuthUser }> = ({ user }) => {
  const [items, setItems] = useState<TakaSafeNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [bellPulse, setBellPulse] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem(`takasafe-notification-sound:${user.id}`) !== 'off');
  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const pulseTimerRef = useRef<number | null>(null);
  const unread = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  useEffect(() => {
    const refresh = () => setItems(readNotifications(user.id));
    const changed = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.userId === user.id) {
        refresh();
        if (detail.action === 'created') {
          setBellPulse(true);
          if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
          pulseTimerRef.current = window.setTimeout(() => setBellPulse(false), 500);
        }
        if (detail.action === 'created' && localStorage.getItem(`takasafe-notification-sound:${user.id}`) !== 'off') {
          try {
            const audio = audioRef.current || new AudioContext();
            audioRef.current = audio;
            if (audio.state === 'suspended') void audio.resume();
            const tone = audio.createOscillator();
            const gain = audio.createGain();
            tone.frequency.value = 740;
            gain.gain.setValueAtTime(0.045, audio.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.14);
            tone.connect(gain); gain.connect(audio.destination);
            tone.start(); tone.stop(audio.currentTime + 0.14);
          } catch { /* Sound is optional when browser audio is unavailable. */ }
        }
      }
    };
    const storage = (event: StorageEvent) => { if (event.key === `takasafe-notifications:${user.id}`) refresh(); };
    refresh();
    window.addEventListener('takasafe-notifications-changed', changed);
    window.addEventListener('storage', storage);
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('takasafe-notifications-changed', changed);
      window.removeEventListener('storage', storage);
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
      if (audioRef.current && audioRef.current.state !== 'closed') void audioRef.current.close();
    };
    function onOutside(event: MouseEvent) { if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false); }
    function onKey(event: KeyboardEvent) { if (event.key === 'Escape') setOpen(false); }
  }, [user.id]);

  const markRead = (id: string) => updateNotifications(user.id, (current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
  const markAllRead = () => updateNotifications(user.id, (current) => current.map((item) => ({ ...item, isRead: true })));
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem(`takasafe-notification-sound:${user.id}`, next ? 'on' : 'off');
    if (next) {
      try { audioRef.current = new AudioContext(); void audioRef.current.resume(); } catch { /* Browser audio may be unavailable. */ }
    }
  };

  return <div ref={rootRef} className="relative">
    <button type="button" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open} onClick={() => setOpen((value) => !value)}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl text-blue-50 transition hover:bg-white/10 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
      <Bell className={`h-5 w-5 ${bellPulse ? 'notification-bell-active' : ''}`} />
      {unread > 0 && <span className="absolute right-0.5 top-0.5 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[#0b1d37] bg-rose-500 px-1 text-[9px] font-black leading-none text-white">{unread > 99 ? '99+' : unread}</span>}
    </button>
    {open && <section aria-label="Notifications" className="notification-panel absolute right-0 top-[calc(100%+12px)] z-[70] flex max-h-[min(560px,calc(100vh-88px))] w-[min(390px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <div><h2 className="text-base font-extrabold">Notifications</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{unread ? `${unread} unread` : 'You’re all caught up'}</p></div>
        <div className="flex items-center gap-1">
          <button onClick={toggleSound} aria-label={soundEnabled ? 'Turn notification sound off' : 'Turn notification sound on'} title={soundEnabled ? 'Sound on' : 'Sound off'} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">{soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
          {unread > 0 && <button onClick={markAllRead} className="rounded-lg px-2.5 py-2 text-xs font-bold text-[#0054A6] hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-slate-800" title="Mark all as read"><CheckCheck className="mr-1 inline h-4 w-4" />All read</button>}
          <button onClick={() => setOpen(false)} aria-label="Close notifications" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
        </div>
      </header>
      <div className="overflow-y-auto overscroll-contain">
        {items.length === 0 ? <div className="flex flex-col items-center px-6 py-12 text-center"><span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#0054A6] dark:bg-slate-800 dark:text-blue-300"><Bell className="h-5 w-5" /></span><p className="font-bold">You’re all caught up!</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No new notifications at the moment.</p></div> : items.map((item) => {
          const Icon = item.type === 'SECURITY' ? ShieldAlert : item.type === 'TRANSACTION' ? CreditCard : item.type === 'ACCOUNT' ? UserRound : Bell;
          return <button key={item.id} onClick={() => markRead(item.id)} className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70 ${item.isRead ? '' : 'bg-blue-50/70 dark:bg-blue-950/25'}`}>
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.type === 'SECURITY' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-blue-100 text-[#0054A6] dark:bg-blue-900/40 dark:text-blue-300'}`}><Icon className="h-[17px] w-[17px]" /></span>
            <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className={`truncate text-sm ${item.isRead ? 'font-semibold' : 'font-extrabold'}`}>{item.title}</span><span className="shrink-0 text-[10px] text-slate-400">{relativeTime(item.createdAt)}</span></span><span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-300">{item.message}</span></span>
            {!item.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
          </button>;
        })}
      </div>
      {items.length > 0 && <footer className="border-t border-slate-100 px-4 py-2 text-center text-[10px] text-slate-400 dark:border-slate-800">Showing your latest {items.length} notifications</footer>}
    </section>}
  </div>;
};
