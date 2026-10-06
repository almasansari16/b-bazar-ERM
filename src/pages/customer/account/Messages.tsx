import { useMarket } from '@/store/useMarket';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ChatView } from '@/components/common/ChatView';
export default function Messages() {
  usePageMeta('Messages');
  const conversations = useMarket((s) => s.conversations);
  return <div className="space-y-4"><div><h1 className="text-2xl font-extrabold">Messages</h1><p className="text-sm text-ink-soft">Chat with sellers and B-Bazar Support</p></div><ChatView box="customer" conversations={conversations} /></div>;
}
