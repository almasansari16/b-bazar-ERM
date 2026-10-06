import { Badge, type BadgeTone } from './Badge';

const MAP: Record<string, [BadgeTone, string]> = {
  pending: ['warning', 'Pending'], confirmed: ['brand', 'Confirmed'], processing: ['violet', 'Processing'], packed: ['violet', 'Packed'],
  shipped: ['accent', 'Shipped'], out_for_delivery: ['accent', 'Out for Delivery'], delivered: ['success', 'Delivered'], cancelled: ['neutral', 'Cancelled'],
  refunded: ['danger', 'Refunded'], approved: ['success', 'Approved'], rejected: ['danger', 'Rejected'], suspended: ['danger', 'Suspended'], draft: ['neutral', 'Draft'],
  active: ['success', 'Active'], blocked: ['danger', 'Blocked'], scheduled: ['brand', 'Scheduled'], expired: ['neutral', 'Expired'], disabled: ['neutral', 'Disabled'],
  ended: ['neutral', 'Ended'], paused: ['warning', 'Paused'], paid: ['success', 'Paid'], failed: ['danger', 'Failed'], on_hold: ['warning', 'On Hold'],
  published: ['success', 'Published'], hidden: ['neutral', 'Hidden'], flagged: ['danger', 'Flagged'], open: ['brand', 'Open'], resolved: ['success', 'Resolved'],
  escalated: ['danger', 'Escalated'], requested: ['warning', 'Requested'], refund_pending: ['violet', 'Refund Pending'], completed: ['success', 'Completed'],
  inactive: ['neutral', 'Inactive'], in_stock: ['success', 'In Stock'], low_stock: ['warning', 'Low Stock'], out_of_stock: ['danger', 'Out of Stock'],
  low: ['neutral', 'Low'], medium: ['brand', 'Medium'], high: ['warning', 'High'], urgent: ['danger', 'Urgent'], enabled: ['success', 'Enabled'],
};
/** Status chip — always pairs color with a dot + text label (never color alone). */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const [tone, label] = MAP[status] ?? ['neutral', status.replace(/_/g, ' ')];
  return <Badge tone={tone} dot className={className}>{label}</Badge>;
}
