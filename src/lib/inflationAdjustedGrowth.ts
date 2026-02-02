export type InflationAdjustedGrowthInputs = {
  /** Current pot value (today's nominal pounds) */
  startingBalance: number;
  /** Regular contribution each month (assumed end of month) */
  monthlyContribution: number;
  /** Nominal annual growth rate, e.g. 6 for 6% */
  annualReturnPct: number;
  /** Annual inflation rate, e.g. 2.5 for 2.5% */
  annualInflationPct: number;
  /** Whole years to run */
  years: number;
};

export type InflationAdjustedGrowthYearRow = {
  year: number;
  endBalanceNominal: number;
  endBalanceReal: number;
  totalContributedNominal: number;
};

export type InflationAdjustedGrowthResult = {
  inputs: Required<InflationAdjustedGrowthInputs>;
  finalBalanceNominal: number;
  finalBalanceReal: number;
  totalContributedNominal: number;
  yearly: InflationAdjustedGrowthYearRow[];
};

function clampNonNegative(n: number) {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Educational inflation-adjusted compound-growth model.
 *
 * Assumptions:
 * - Constant nominal return and constant inflation.
 * - Monthly compounding.
 * - Contributions are made at end of month.
 * - "Real" values are expressed in today's pounds by deflating by cumulative inflation.
 *
 * Note: This is not a full financial planning model (no fees, taxes, volatility, sequence risk, etc.).
 */
export function computeInflationAdjustedGrowth(raw: InflationAdjustedGrowthInputs): InflationAdjustedGrowthResult {
  const startingBalance = clampNonNegative(raw.startingBalance);
  const monthlyContribution = clampNonNegative(raw.monthlyContribution);
  const years = Math.max(0, Math.round(raw.years));
  const annualReturnPct = Number.isFinite(raw.annualReturnPct) ? raw.annualReturnPct : 0;
  const annualInflationPct = Number.isFinite(raw.annualInflationPct) ? raw.annualInflationPct : 0;

  const months = years * 12;

  // Keep the model consistent with the other calculators in this repo:
  // treat the annual rates as nominal rates and divide evenly across months.
  const monthlyReturn = (annualReturnPct / 100) / 12;
  const monthlyInflation = (annualInflationPct / 100) / 12;

  let balanceNominal = startingBalance;
  let contributedNominal = 0;
  let inflationIndex = 1; // 1 == today, grows with inflation.

  const yearly: InflationAdjustedGrowthYearRow[] = [];

  for (let m = 1; m <= months; m++) {
    // Grow nominal balance, then add end-of-month contribution.
    balanceNominal = balanceNominal * (1 + monthlyReturn);
    balanceNominal = balanceNominal + monthlyContribution;
    contributedNominal += monthlyContribution;

    // End-of-month inflation adjustment.
    inflationIndex = inflationIndex * (1 + monthlyInflation);

    const isYearEnd = m % 12 === 0;
    if (isYearEnd) {
      const year = m / 12;
      yearly.push({
        year,
        endBalanceNominal: balanceNominal,
        endBalanceReal: balanceNominal / inflationIndex,
        totalContributedNominal: contributedNominal,
      });
    }
  }

  const finalBalanceNominal = balanceNominal;
  const finalBalanceReal = months === 0 ? startingBalance : balanceNominal / inflationIndex;

  return {
    inputs: {
      startingBalance,
      monthlyContribution,
      annualReturnPct,
      annualInflationPct,
      years,
    },
    finalBalanceNominal,
    finalBalanceReal,
    totalContributedNominal: contributedNominal,
    yearly,
  };
}
