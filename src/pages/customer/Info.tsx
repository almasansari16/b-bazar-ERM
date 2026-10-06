import { useParams } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Breadcrumb } from '@/components/ui/Display';
import { StoreBadges } from '@/components/customer/StoreBadges';

const PAGES: Record<string, [string, string[]]> = {
  about: ['About B-Bazar', ['B-Bazar is a Pakistani multi-vendor marketplace connecting millions of shoppers with more than 1,200 verified sellers across electronics, fashion, grocery and more.', 'Our mission is simple: Everything You Need. All in One Bazar. We combine trusted sellers, fast nationwide delivery and payment options built for Pakistan — cash on delivery, JazzCash, Easypaisa and cards.']],
  returns: ['Returns & Refunds', ['Most items can be returned within 7 days of delivery if they are unused and in original packaging.', 'Request a return from My Orders. We schedule a free pickup, inspect the item within 48 hours and refund to your original payment method or B-Bazar Wallet.']],
  shipping: ['Shipping Policy', ['Karachi: 1–2 days. Lahore & Islamabad: 2–4 days. Other cities: 3–7 days.', 'Standard delivery is Rs. 199, free on orders above Rs. 2,999. Express delivery is Rs. 449 in major cities.']],
  privacy: ['Privacy Policy', ['We collect only the information needed to process orders and improve your experience. We never sell your personal data.', 'You can download or delete your data at any time from Account settings.']],
  terms: ['Terms & Conditions', ['By using B-Bazar you agree to our marketplace terms, seller policies and buyer protection programme.', 'Prices are listed in PKR and include applicable taxes unless stated otherwise.']],
  contact: ['Contact Us', ['Customer support: 021-111-BAZAR (22927) · support@bbazar.pk', 'Head office: B-Bazar (Pvt) Ltd, Shahrah-e-Faisal, Karachi.']],
  'download-app': ['Download the B-Bazar App', ['Shop faster, track orders and discover exclusive deals from your phone.']],
};
export default function Info() {
  const { slug = '' } = useParams();
  const [title, body] = PAGES[slug] ?? [slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), ['This page is part of the B-Bazar demo. Content will be managed from the admin CMS.']];
  usePageMeta(title);
  return (
    <div className="container-x py-6">
      <Breadcrumb items={[{ label: title }]} />
      <article className="mx-auto mt-6 max-w-3xl rounded-2xl border border-line bg-white p-6 sm:p-10">
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <div className="mt-5 space-y-4 leading-relaxed text-ink/85">{body.map((p) => <p key={p}>{p}</p>)}</div>
        {slug === 'download-app' && <div className="mt-6"><StoreBadges /></div>}
      </article>
    </div>
  );
}
