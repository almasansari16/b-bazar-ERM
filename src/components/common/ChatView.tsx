import { useEffect, useRef, useState } from 'react';
import { Send, ArrowLeft, Search, Paperclip, MessagesSquare, Headset } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Conversation } from '@/types';
import { useMarket } from '@/store/useMarket';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/Display';
import { timeAgo } from '@/utils/format';

const AUTO: Record<string, string[]> = {
  seller: ['Thanks for your message! Let me check that for you.', 'Yes, it is available and ships today from our warehouse.', 'You can also use code BAZAR10 for an extra discount.'],
  support: ['Thanks for reaching out to B-Bazar Support. An agent is reviewing your request.', 'I have updated your case — you will get an SMS shortly.'],
  customer: ['Okay, thank you!', 'Great, I will place the order now.', 'JazkAllah, that helps.'],
};

/** Two-pane chat UI shared by customer and seller inboxes. */
export function ChatView({ box, conversations }: { box: 'customer' | 'seller'; conversations: Conversation[] }) {
  const send = useMarket((s) => s.sendMessage);
  const read = useMarket((s) => s.readConversation);
  const [activeId, setActiveId] = useState<string | null>(typeof window !== 'undefined' && window.innerWidth >= 768 ? conversations[0]?.id ?? null : null);
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const active = conversations.find((c) => c.id === activeId);

  useEffect(() => { if (activeId) read(box, activeId); }, [activeId, box, read]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [active?.messages.length, typing]);

  const submit = () => {
    if (!text.trim() || !active) return;
    send(box, active.id, text.trim());
    setText('');
    setTyping(true);
    const replies = AUTO[active.kind] ?? AUTO.seller;
    setTimeout(() => {
      setTyping(false);
      useMarket.setState((s) => {
        const key = box === 'customer' ? 'conversations' : 'sellerInbox';
        return { [key]: s[key].map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, { id: `r${Date.now()}`, from: 'them' as const, text: replies[c.messages.length % replies.length], at: new Date().toISOString() }] } : c)) };
      });
    }, 1400);
  };
  const list = conversations.filter((c) => c.with.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="grid h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-2xl border border-line bg-white md:grid-cols-[300px_1fr]">
      <div className={cn('flex min-h-0 flex-col border-r border-line', active && 'hidden md:flex')}>
        <div className="border-b border-line p-3"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" icon={<Search className="h-4 w-4" />} aria-label="Search conversations" /></div>
        <ul className="flex-1 overflow-y-auto">
          {list.map((c) => {
            const last = c.messages.at(-1);
            return (
              <li key={c.id}>
                <button type="button" onClick={() => setActiveId(c.id)} className={cn('flex w-full items-center gap-3 px-3 py-3 text-left transition', c.id === activeId ? 'bg-brand-50' : 'hover:bg-muted')}>
                  <span className="relative">{c.kind === 'support' ? <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient text-white"><Headset className="h-5 w-5" /></span> : <Avatar name={c.with} color={c.avatarColor} />}{c.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" aria-label="Online" />}</span>
                  <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{c.with}</span><span className="shrink-0 text-[10px] text-ink-soft">{last && timeAgo(last.at)}</span></span><span className="block truncate text-xs text-ink-soft">{last?.from === 'me' && 'You: '}{last?.text}</span></span>
                  {c.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{c.unread}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {active ? (
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <button type="button" className="md:hidden" onClick={() => setActiveId(null)} aria-label="Back to conversations"><ArrowLeft className="h-5 w-5" /></button>
            <Avatar name={active.with} color={active.avatarColor} size="sm" />
            <div><p className="text-sm font-bold">{active.with}</p><p className="text-xs text-ink-soft">{active.online ? 'Online · usually replies in minutes' : 'Offline · replies within a few hours'}</p></div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4" aria-live="polite">
            {active.messages.map((m) => (
              <div key={m.id} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm', m.from === 'me' ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-white text-ink ring-1 ring-line')}>
                  {m.text}<span className={cn('mt-0.5 block text-[10px]', m.from === 'me' ? 'text-white/60' : 'text-ink-soft')}>{timeAgo(m.at)}</span>
                </div>
              </div>
            ))}
            {typing && <div className="flex"><div className="flex gap-1 rounded-2xl bg-white px-4 py-3 ring-1 ring-line">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 120}ms` }} />)}</div></div>}
            <div ref={end} />
          </div>
          <form className="flex items-center gap-2 border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-ink-soft hover:bg-muted" aria-label="Attach file"><Paperclip className="h-4 w-4" /></button>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" aria-label="Message" />
            <button type="submit" disabled={!text.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-600 text-white disabled:opacity-40" aria-label="Send message"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      ) : (
        <div className="hidden md:block"><EmptyState icon={<MessagesSquare className="h-7 w-7" />} title="Select a conversation" message="Choose a chat from the list to view messages." /></div>
      )}
    </div>
  );
}
