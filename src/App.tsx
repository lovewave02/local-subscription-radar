import { useMemo, useState } from 'react';
import { analyzeReceiptText, exportCsv, exportMarkdown } from './analyzer';
import { samples } from './samples';

const feedbackUrl =
  'https://github.com/lovewave02/local-subscription-radar/issues/new?template=usage_feedback.yml';

export default function App() {
  const [input, setInput] = useState(samples[0].text);
  const analysis = useMemo(() => analyzeReceiptText(input), [input]);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Local-first money leak finder</p>
        <h1>Spot subscriptions hiding inside receipt text.</h1>
        <p className="hero-copy">
          No bank login, no upload. Paste receipts or subscription emails locally and
          review recurring charges, renewal clues, and refund windows before they turn
          into quiet monthly leakage.
        </p>
        <div className="privacy-card">
          <span>No external API calls</span>
          <span>Sample data included</span>
          <span>Organizer only, not financial advice</span>
        </div>
      </section>

      <section className="workflow-grid" aria-label="Three step workflow">
        <Step number="01" title="Paste or load sample" />
        <Step number="02" title="Review detected charges" />
        <Step number="03" title="Export or leave feedback" />
      </section>

      <section className="workspace">
        <div className="panel input-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Input</p>
              <h2>Receipt or subscription text</h2>
            </div>
            <button className="ghost-button" type="button" onClick={() => setInput('')}>
              Clear
            </button>
          </div>

          <div className="sample-row" aria-label="Sample data buttons">
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className="sample-button"
                onClick={() => setInput(sample.text)}
                title={sample.description}
              >
                {sample.label}
              </button>
            ))}
          </div>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste redacted receipt or subscription email text here."
            spellCheck={false}
          />
        </div>

        <div className="panel result-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Monthly leakage estimate</p>
              <h2>{formatMoney(analysis.monthlyLeakageEstimate)}</h2>
            </div>
            <span className="merchant-pill">{analysis.merchantCount} merchants</span>
          </div>

          <Section title="Detected recurring charges">
            {analysis.charges.length ? (
              <div className="charge-list">
                {analysis.charges.map((charge) => (
                  <article key={`${charge.merchant}-${charge.sourceLine}`} className="charge-card">
                    <div>
                      <h3>{charge.merchant}</h3>
                      <p>
                        {formatCurrency(charge.amount, charge.currency)} · {charge.frequency}
                      </p>
                    </div>
                    <strong>{formatCurrency(charge.monthlyEquivalent, charge.currency)}/mo</strong>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState text="No recurring charges detected yet." />
            )}
          </Section>

          <Section title="Trial/refund/deadline clues">
            {analysis.deadlineClues.length ? (
              <ul className="clue-list">
                {analysis.deadlineClues.map((clue) => (
                  <li key={`${clue.label}-${clue.sourceLine}`}>
                    <span>{clue.label}</span>
                    <p>{clue.sourceLine}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState text="No trial, refund, renewal, or cancellation clues found." />
            )}
          </Section>

          <Section title="Needs review">
            {analysis.needsReview.length ? (
              <ul className="review-list">
                {analysis.needsReview.map((item) => (
                  <li key={`${item.reason}-${item.sourceLine}`}>
                    <span>{item.reason}</span>
                    <p>{item.sourceLine}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState text="No ambiguous amount lines in this input." />
            )}
          </Section>

          <div className="export-row">
            <button type="button" onClick={() => copy(exportMarkdown(analysis))}>
              Copy Markdown
            </button>
            <button type="button" onClick={() => copy(exportCsv(analysis))}>
              Copy CSV
            </button>
            <a href={feedbackUrl} target="_blank" rel="noreferrer">
              Leave feedback
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({ number, title }: { number: string; title: string }) {
  return (
    <article className="step-card">
      <span>{number}</span>
      <strong>{title}</strong>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="result-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="empty-state">{text}</p>;
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatCurrency(value: number, currency: string) {
  if (currency === 'KRW') return `₩${Math.round(value).toLocaleString('ko-KR')}`;
  return `$${value.toFixed(2)}`;
}

async function copy(text: string) {
  await navigator.clipboard.writeText(text);
}
