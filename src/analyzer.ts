export type Frequency = 'weekly' | 'monthly' | 'yearly' | 'one_time' | 'unknown';

export type Charge = {
  merchant: string;
  amount: number;
  currency: string;
  frequency: Frequency;
  sourceLine: string;
  monthlyEquivalent: number;
  confidence: 'high' | 'medium' | 'low';
};

export type DeadlineClue = {
  label: string;
  date?: string;
  sourceLine: string;
};

export type ReviewItem = {
  reason: string;
  sourceLine: string;
};

export type Analysis = {
  charges: Charge[];
  deadlineClues: DeadlineClue[];
  needsReview: ReviewItem[];
  monthlyLeakageEstimate: number;
  merchantCount: number;
};

const amountPattern =
  /(?:(?<symbol>[$₩])\s?(?<symbolAmount>\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)|(?<code>USD|KRW|EUR|GBP)\s?(?<codeAmount>\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)|(?<plainAmount>\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s?(?<plainCode>원|KRW|USD|달러))/iu;

const datePattern =
  /\b(20\d{2}[-./]\d{1,2}[-./]\d{1,2}|\d{1,2}[-./]\d{1,2}[-./]20\d{2})\b/;

const deadlineKeywords = [
  'trial',
  'free',
  'refund',
  'cancel',
  'cancellation',
  'renew',
  'renews',
  'renewal',
  'expires',
  '무료',
  '체험',
  '환불',
  '취소',
  '갱신',
  '만료',
];

const frequencyRules: Array<[Frequency, RegExp]> = [
  ['weekly', /(weekly|week|per week|every week|주간|매주)/i],
  ['monthly', /(monthly|month|per month|every month|\/month|\/mo|매월|월간|구독)/i],
  ['yearly', /(yearly|annual|annually|per year|every year|\/year|연간|매년)/i],
];

export function analyzeReceiptText(text: string): Analysis {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const charges: Charge[] = [];
  const deadlineClues: DeadlineClue[] = [];
  const needsReview: ReviewItem[] = [];
  const merchantOccurrences = new Map<string, number>();

  lines.forEach((line, index) => {
    const amount = parseAmount(line);
    const frequency = detectFrequency(line);
    const hasDeadlineKeyword = deadlineKeywords.some((keyword) =>
      line.toLowerCase().includes(keyword.toLowerCase()),
    );

    if (hasDeadlineKeyword) {
      deadlineClues.push({
        label: classifyDeadline(line),
        date: line.match(datePattern)?.[1],
        sourceLine: line,
      });
    }

    if (!amount) {
      return;
    }

    const merchant = inferMerchant(lines, index);
    const merchantKey = normalizeMerchant(merchant);
    merchantOccurrences.set(merchantKey, (merchantOccurrences.get(merchantKey) ?? 0) + 1);

    const chargeFrequency = frequency === 'unknown' ? detectFrequency(lines[index + 1] ?? '') : frequency;
    const recurringByRepeat = (merchantOccurrences.get(merchantKey) ?? 0) > 1;
    const finalFrequency =
      chargeFrequency === 'unknown' && recurringByRepeat ? 'monthly' : chargeFrequency;

    const charge: Charge = {
      merchant,
      amount: amount.value,
      currency: amount.currency,
      frequency: finalFrequency,
      sourceLine: line,
      monthlyEquivalent: toMonthly(amount.value, finalFrequency),
      confidence: confidenceFor(finalFrequency, recurringByRepeat),
    };
    charges.push(charge);

    if (finalFrequency === 'unknown') {
      needsReview.push({
        reason: 'Amount found, but no repeat cadence was detected.',
        sourceLine: line,
      });
    }
  });

  const grouped = mergeCharges(charges);

  return {
    charges: grouped,
    deadlineClues,
    needsReview,
    monthlyLeakageEstimate: roundMoney(
      grouped.reduce((sum, charge) => sum + charge.monthlyEquivalent, 0),
    ),
    merchantCount: new Set(grouped.map((charge) => normalizeMerchant(charge.merchant))).size,
  };
}

export function exportMarkdown(analysis: Analysis): string {
  const rows = analysis.charges
    .map(
      (charge) =>
        `- ${charge.merchant}: ${formatMoney(charge.amount, charge.currency)} ${charge.frequency} (~${formatMoney(charge.monthlyEquivalent, charge.currency)}/month)`,
    )
    .join('\n');
  const clues = analysis.deadlineClues
    .map((clue) => `- ${clue.label}${clue.date ? ` (${clue.date})` : ''}: ${clue.sourceLine}`)
    .join('\n');
  const review = analysis.needsReview
    .map((item) => `- ${item.reason}: ${item.sourceLine}`)
    .join('\n');

  return `# Local Subscription Radar Export

Estimated monthly leakage: ${formatMoney(analysis.monthlyLeakageEstimate, 'USD')}
Detected merchants: ${analysis.merchantCount}

## Detected recurring charges
${rows || '- None detected'}

## Trial/refund/deadline clues
${clues || '- None detected'}

## Needs review
${review || '- None'}
`;
}

export function exportCsv(analysis: Analysis): string {
  const header = 'merchant,amount,currency,frequency,monthly_equivalent,confidence,source_line';
  const rows = analysis.charges.map((charge) =>
    [
      charge.merchant,
      charge.amount,
      charge.currency,
      charge.frequency,
      charge.monthlyEquivalent,
      charge.confidence,
      charge.sourceLine,
    ]
      .map(csvEscape)
      .join(','),
  );
  return [header, ...rows].join('\n');
}

function parseAmount(line: string): { value: number; currency: string } | null {
  const match = line.match(amountPattern);
  if (!match?.groups) {
    return null;
  }
  const raw =
    match.groups.symbolAmount ?? match.groups.codeAmount ?? match.groups.plainAmount ?? '';
  const value = Number(raw.replace(/,/g, ''));
  if (!Number.isFinite(value)) {
    return null;
  }
  const currency =
    match.groups.symbol === '₩' || match.groups.code === 'KRW' || match.groups.plainCode === '원'
      ? 'KRW'
      : match.groups.code || match.groups.plainCode || 'USD';
  return { value, currency: currency.toUpperCase() === '원' ? 'KRW' : currency.toUpperCase() };
}

function detectFrequency(line: string): Frequency {
  for (const [frequency, pattern] of frequencyRules) {
    if (pattern.test(line)) {
      return frequency;
    }
  }
  return 'unknown';
}

function inferMerchant(lines: string[], amountLineIndex: number): string {
  const candidates = [
    lines[amountLineIndex - 1],
    lines[amountLineIndex - 2],
    lines[amountLineIndex - 3],
    lines[amountLineIndex - 4],
    lines[amountLineIndex],
  ]
    .filter(Boolean)
    .map(cleanMerchant)
    .filter(
      (candidate) => candidate && !amountPattern.test(candidate) && !isGenericReceiptLine(candidate),
    );
  return candidates[0] || 'Unknown merchant';
}

function cleanMerchant(value: string): string {
  return value
    .replace(datePattern, '')
    .replace(/\b(receipt|charged|paid|payment|confirmation|order|invoice|plan|renewal)\b/gi, '')
    .replace(/[#:_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMerchant(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]/gi, '');
}

function isGenericReceiptLine(value: string): boolean {
  return /^(receipt|order|invoice|payment|confirmation|charged|paid|plan|renewal|\d+|sn\s?\d+)$/i.test(
    value.trim(),
  );
}

function toMonthly(amount: number, frequency: Frequency): number {
  if (frequency === 'weekly') return roundMoney(amount * 4.345);
  if (frequency === 'monthly') return roundMoney(amount);
  if (frequency === 'yearly') return roundMoney(amount / 12);
  return 0;
}

function classifyDeadline(line: string): string {
  const lower = line.toLowerCase();
  if (lower.includes('refund') || lower.includes('환불')) return 'Refund window';
  if (lower.includes('trial') || lower.includes('free') || lower.includes('무료')) return 'Trial clue';
  if (lower.includes('cancel') || lower.includes('취소')) return 'Cancellation clue';
  if (lower.includes('renew') || lower.includes('갱신')) return 'Renewal clue';
  return 'Deadline clue';
}

function confidenceFor(frequency: Frequency, recurringByRepeat: boolean): Charge['confidence'] {
  if (frequency !== 'unknown') return 'high';
  if (recurringByRepeat) return 'medium';
  return 'low';
}

function mergeCharges(charges: Charge[]): Charge[] {
  const bestByMerchant = new Map<string, Charge>();
  for (const charge of charges) {
    const key = normalizeMerchant(charge.merchant);
    const existing = bestByMerchant.get(key);
    if (!existing || charge.monthlyEquivalent > existing.monthlyEquivalent) {
      bestByMerchant.set(key, charge);
    }
  }
  return Array.from(bestByMerchant.values()).sort(
    (a, b) => b.monthlyEquivalent - a.monthlyEquivalent,
  );
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatMoney(value: number, currency: string): string {
  if (currency === 'KRW') return `₩${Math.round(value).toLocaleString('ko-KR')}`;
  return `$${value.toFixed(2)}`;
}

function csvEscape(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
