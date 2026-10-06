import { useMarket } from '@/store/useMarket';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PageHeader } from '@/components/dashboard';
import { ChatView } from '@/components/common/ChatView';
export default function SellerMessages() {
  usePageMeta('Messages · Seller Center');
  const inbox = useMarket((s) => s.sellerInbox);
  return <><PageHeader title="Messages" subtitle="Answer buyers quickly — response rate affects your store ranking" /><ChatView box="seller" conversations={inbox} /></>;
}
