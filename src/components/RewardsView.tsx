import { useState } from 'react';
import {
  REDEMPTION_VALUE_CENTS,
  VOUCHERS_PER_REDEMPTION,
  type Family,
  type Redemption,
  type Voucher,
} from '@/lib/types';
import { requestRedemption } from '@/lib/lcp';
import { money, dayLabel } from '@/lib/format';

const HOUSING_CAP_CENTS = 120_000; // $1,200/yr cap (perfect-month housing credit)

export function RewardsView({
  family,
  vouchers,
  redemptions,
  onChange,
}: {
  family: Family;
  vouchers: Voucher[];
  redemptions: Redemption[];
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const unspent = vouchers.filter((v) => !v.redemption_id).length;
  const pending = redemptions.filter((r) => r.status === 'requested').length;
  const available = Math.max(0, unspent - pending * VOUCHERS_PER_REDEMPTION);
  const canRedeem = available >= VOUCHERS_PER_REDEMPTION;
  const housingPct = Math.min(100, Math.round((family.housing_savings_cents / HOUSING_CAP_CENTS) * 100));

  async function redeem() {
    setBusy(true);
    await requestRedemption(family.id);
    setBusy(false);
    onChange();
  }

  return (
    <div className="space-y-4">
      <section className="card text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-sparrow-gold">Vouchers</p>
        <p className="mt-1 font-serif text-5xl font-semibold text-sparrow-green">{unspent}</p>
        <p className="mt-1 text-sm text-sparrow-gray">
          earned · {VOUCHERS_PER_REDEMPTION} vouchers = a {money(REDEMPTION_VALUE_CENTS)} gift card
        </p>

        <button onClick={redeem} disabled={!canRedeem || busy} className="btn-primary mt-4 w-full">
          {canRedeem ? `Redeem 3 for a ${money(REDEMPTION_VALUE_CENTS)} gift card` : `Earn ${VOUCHERS_PER_REDEMPTION - available} more to redeem`}
        </button>
        {pending > 0 && (
          <p className="mt-2 text-xs text-sparrow-green">
            {pending} redemption{pending > 1 ? 's' : ''} requested — Shelly will hand you the gift card soon. 🎁
          </p>
        )}
      </section>

      <section className="card">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg font-semibold">Housing savings</h2>
          <span className="font-serif text-lg font-semibold text-sparrow-green">
            {money(family.housing_savings_cents)}
          </span>
        </div>
        <p className="text-xs text-sparrow-gray">A perfect month earns $100 toward housing at graduation.</p>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-sparrow-sage">
          <div
            className="h-full rounded-full bg-sparrow-gold transition-all duration-500"
            style={{ width: `${housingPct}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-sparrow-gray">of {money(HOUSING_CAP_CENTS)} / year</p>
      </section>

      {redemptions.length > 0 && (
        <section className="card">
          <h2 className="font-serif text-lg font-semibold">History</h2>
          <ul className="mt-2 divide-y divide-sparrow-rule/70">
            {redemptions.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-sparrow-ink">{money(r.gift_card_value_cents)} gift card</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-sparrow-gray">{dayLabel(r.requested_at)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      r.status === 'fulfilled'
                        ? 'bg-sparrow-green/10 text-sparrow-green'
                        : 'bg-sparrow-gold/15 text-sparrow-gold'
                    }`}
                  >
                    {r.status === 'fulfilled' ? 'Given' : 'Requested'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
