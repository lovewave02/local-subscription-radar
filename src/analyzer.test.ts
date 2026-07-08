import { describe, expect, it } from 'vitest';
import { analyzeReceiptText } from './analyzer';
import { samples } from './samples';

describe('analyzeReceiptText', () => {
  it('detects recurring monthly items from sample text', () => {
    const result = analyzeReceiptText(samples[0].text);
    expect(result.charges.some((charge) => charge.merchant.includes('StreamNest'))).toBe(true);
    expect(result.charges.some((charge) => charge.frequency === 'monthly')).toBe(true);
    expect(result.monthlyLeakageEstimate).toBeGreaterThan(20);
  });

  it('normalizes annual charges into a monthly equivalent', () => {
    const result = analyzeReceiptText('CloudVault Storage\n$120.00 paid today\nRenews yearly');
    expect(result.charges[0].frequency).toBe('yearly');
    expect(result.charges[0].monthlyEquivalent).toBe(10);
  });

  it('captures trial and cancellation deadline clues', () => {
    const result = analyzeReceiptText(samples[1].text);
    expect(result.deadlineClues.some((clue) => clue.label === 'Trial clue')).toBe(true);
    expect(result.deadlineClues.some((clue) => clue.label === 'Cancellation clue')).toBe(true);
  });

  it('marks unknown cadence amounts for review', () => {
    const result = analyzeReceiptText('Corner Store\nReceipt\n$18.40 paid today');
    expect(result.needsReview).toHaveLength(1);
    expect(result.charges[0].monthlyEquivalent).toBe(0);
  });

  it('detects Korean won amounts and monthly cadence', () => {
    const result = analyzeReceiptText('Garden Notes Plus\n₩5,500 paid\n구독은 매월 갱신됩니다');
    expect(result.charges[0].currency).toBe('KRW');
    expect(result.charges[0].frequency).toBe('monthly');
    expect(result.charges[0].monthlyEquivalent).toBe(5500);
  });
});
