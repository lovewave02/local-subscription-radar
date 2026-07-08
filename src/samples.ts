export type Sample = {
  id: string;
  label: string;
  description: string;
  text: string;
};

export const samples: Sample[] = [
  {
    id: 'streaming',
    label: 'Streaming bundle',
    description: 'Monthly subscriptions with one annual renewal.',
    text: `StreamNest
Receipt #SN-4821
Charged $14.99 on 2026-07-01
Plan renews monthly until canceled.

MusicBox Premium
Payment confirmation
USD 9.99 charged 2026-07-02
Your subscription renews every month.

CloudVault Storage
Annual plan renewal
$119.88 paid on 2026-07-03
Renews yearly on 2027-07-03.`,
  },
  {
    id: 'trial',
    label: 'Trial + app store',
    description: 'Trial end and cancellation clues from app receipts.',
    text: `FocusPro Trial
Free trial started 2026-07-08
After trial, $7.99/month begins on 2026-07-22.
Cancel before 2026-07-21 to avoid the first charge.

Garden Notes Plus
Order GP-1190
₩5,500 paid on 2026-07-07
In-app subscription renews monthly.`,
  },
  {
    id: 'refund',
    label: 'Shopping + refund window',
    description: 'One-time purchase plus refund and review reminders.',
    text: `Northwind Market
Order #A-77831
KRW 42,000 paid 2026-07-04
Refund available until 2026-07-18 if unopened.

PocketScan Pro
Receipt 2026-07-06
$4.99 billed weekly after the first week.
Review subscription settings before 2026-07-13.`,
  },
];
