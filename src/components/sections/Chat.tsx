'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ChatMessage } from '@/lib/project/demo-content';
import type { TeamMember } from '@/lib/project/view';
import { Lightbox, type LightboxPhoto } from './Lightbox';

const tag = (name: string) => '@' + name.replace(/\s+/g, '_');
const initials = (name: string) => name.split(/\s+/).map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase();
const now = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function Chat({ initial, team, currentStage }: { initial: ChatMessage[]; team: TeamMember[]; currentStage: string }) {
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState('');
  const [quote, setQuote] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [sheet, setSheet] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<{ photos: LightboxPhoto[]; index: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const addTags = (names: string[]) => {
    const tags = names.map(tag).filter((t) => !draft.includes(t));
    if (tags.length) setDraft((d) => (d ? d.replace(/\s*$/, ' ') : '') + tags.join(' ') + ' ');
    inputRef.current?.focus();
  };

  const send = () => {
    const text = draft.trim();
    if (!text && files.length === 0) return;
    setMessages((m) => [...m, { kind: 'msg', id: `local-${m.length}`, author: 'Вы', mine: true, quote: quote ?? undefined, text, files: files.length, time: now() }]);
    setDraft('');
    setQuote(null);
    setFiles([]);
  };

  return (
    <div className="chat">
      <div className="chat-main card">
        <div className="chat-list" ref={listRef}>
          {messages.map((m) => {
            if (m.kind === 'event') return <div key={m.id} className="chat-event"><span>{m.text} · {m.time}</span></div>;
            if (m.kind === 'doc')
              return (
                <Link key={m.id} href="/docs" className="chat-doc">
                  <DocIcon />
                  <span><b>{m.text}</b><span className="muted small">Новый документ · {m.time}</span></span>
                </Link>
              );
            if (m.kind === 'report') {
              const all = m.photos.map((p) => ({ ...p, caption: `${m.stage} · ${m.time}` }));
              return (
                <div key={m.id} className="chat-report">
                  <div className="chat-report-head"><b>{m.author}</b><span className="muted small">Фотоотчёт · {m.stage}</span></div>
                  <div className="chat-report-grid">
                    {m.photos.slice(0, 5).map((p, i) => (
                      <button key={i} type="button" onClick={() => setLightbox({ photos: all, index: i })} aria-label="Открыть фото">
                        <img src={p.src} alt="" style={{ objectPosition: p.position }} />
                        {i === 4 && m.total > 5 ? <span className="more">+{m.total - 5}</span> : null}
                      </button>
                    ))}
                  </div>
                  <p>{m.text}</p>
                  <div className="chat-report-foot">
                    <button type="button" className="link-btn" onClick={() => setQuote(`${m.author.split(',')[0]}: ${m.text.slice(0, 60)}…`)}>Ответить</button>
                    <span className="muted small">{m.total} файлов · {m.time}</span>
                  </div>
                </div>
              );
            }
            return (
              <div key={m.id} className={`chat-row${m.mine ? ' mine' : ''}`}>
                <div className="chat-bubble">
                  <b>{m.author}</b>
                  {m.quote ? <div className="chat-quote">{m.quote}</div> : null}
                  {m.files ? <div className="chat-files">📎 {m.files} {plural(m.files, 'файл', 'файла', 'файлов')} · этап «{currentStage}»</div> : null}
                  {m.text ? <span>{m.text}</span> : null}
                  <span className="chat-time">{m.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="chat-compose">
          {files.length ? (
            <div className="chat-chip warm">
              <span>Прикреплено {files.length} {plural(files.length, 'файл', 'файла', 'файлов')} · попадут в этап «{currentStage}»</span>
              <button type="button" onClick={() => setFiles([])} aria-label="Убрать вложения">×</button>
            </div>
          ) : null}
          {quote ? (
            <div className="chat-chip">
              <span>Ответ на: {quote}</span>
              <button type="button" onClick={() => setQuote(null)} aria-label="Убрать цитату">×</button>
            </div>
          ) : null}
          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
            <button type="button" className="icon-btn" onClick={() => fileRef.current?.click()} aria-label="Прикрепить фото и видео"><ClipIcon /></button>
            <button type="button" className="icon-btn team-btn" onClick={() => { setPicked([]); setSheet(true); }} aria-label="Обратиться к участнику команды"><TeamIcon /></button>
            <label className="sr" htmlFor="chat-draft">Сообщение</label>
            <input id="chat-draft" ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Сообщение" autoComplete="off" />
            <button type="submit" className="btn send-btn">Отправить</button>
          </form>
        </div>
      </div>

      <aside className="chat-side card">
        <h2>Участники чата</h2>
        {team.map((p) => (
          <div key={p.userId + p.role} className="chat-member">
            <span className="avatar small-avatar">{initials(p.name)}</span>
            <span className="chat-member-name"><b>{p.name}</b><span className="muted small">{p.role}</span></span>
            <button type="button" className="at-btn" onClick={() => addTags([p.name])} aria-label={`Отметить ${p.name}`}>@</button>
          </div>
        ))}
        <span className="muted small">Отмеченный сотрудник сразу получит уведомление.</span>
        <Link href="/photos" className="link-btn">Все фото и видео</Link>
      </aside>

      {sheet ? (
        <div className="sheet-backdrop" onClick={() => setSheet(false)}>
          <div className="sheet" role="dialog" aria-label="Команда проекта" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h2>Кому адресовать сообщение</h2>
            {team.map((p) => {
              const on = picked.includes(p.name);
              return (
                <button key={p.userId + p.role} type="button" className={`sheet-row${on ? ' on' : ''}`} onClick={() => setPicked(on ? picked.filter((n) => n !== p.name) : [...picked, p.name])}>
                  <span className="avatar small-avatar">{initials(p.name)}</span>
                  <span className="chat-member-name"><b>{p.name}</b><span className="muted small">{p.role}</span></span>
                  <span className="check">{on ? '✓' : ''}</span>
                </button>
              );
            })}
            <button type="button" className="btn btn-accent" disabled={!picked.length} onClick={() => { addTags(picked); setSheet(false); }}>
              Обратиться{picked.length ? ` (${picked.length})` : ''}
            </button>
          </div>
        </div>
      ) : null}

      {lightbox ? <Lightbox photos={lightbox.photos} index={lightbox.index} onClose={() => setLightbox(null)} /> : null}
    </div>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const DocIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5" /></svg>
);
const ClipIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 11.5l-8.2 8.2a5 5 0 01-7.1-7.1l8.6-8.6a3.4 3.4 0 014.8 4.8l-8.6 8.6a1.7 1.7 0 01-2.4-2.4l7.9-7.9" /></svg>
);
const TeamIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="9" cy="8" r="3.2" /><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M16 13.6c2.8.2 5 2.2 5 5" /></svg>
);
