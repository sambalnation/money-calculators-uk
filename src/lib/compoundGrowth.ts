export type ContributionTiming = 'startOfPeriod' | 'endOfPeriod';

export type CompoundGrowthInputs = {
  /** Current pot value */
  startingBalance: number;
  /** Regular contribution each month */
  monthlyContribution: number;
  /** Nominal annual growth rate, e.g. 5 for 5% */
  annualRatePct: number;
  /** Whole years to run */
  years: number;
  /** Number of compounding periods per year (defaults to monthly). */
  periodsPerYear?: number;
  /**
   * When contributions are applied relative to growth.
   * - endOfPeriod: grow then deposit (typical "end of month" savings)
   * - startOfPeriod: deposit then grow (annuity due; closer to "start of month" investing)
   */
  contributionTiming?: ContributionTiming;
};

export type CompoundGrowthYearRow = {
  year: number;
  endBalance: number;
  totalContributed: number;
  totalGrowth: number;
};

export type CompoundGrowthResult = {
  inputs: Required<CompoundGrowthInputs>;
  finalBalance: number;
  totalContributed: number;
  totalGrowth: number;
  yearly: CompoundGrowthYearRow[];
};

function clampNonNegative(n: number) {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Educational compound-growth model.
 * Assumptions:
 * - Growth is constant (nominal annual rate).
 * - Compounding happens evenly each period.
 * - Contributions are made at either the start or end of each period (configurable).
 */
export function computeCompoundGrowth(raw: CompoundGrowthInputs): CompoundGrowthResult {
  const periodsPerYear = Math.max(1, Math.round(raw.periodsPerYear ?? 12));
  const startingBalance = clampNonNegative(raw.startingBalance);
  const monthlyContribution = clampNonNegative(raw.monthlyContribution);
  const years = Math.max(0, Math.round(raw.years));
  const annualRatePct = Number.isFinite(raw.annualRatePct) ? raw.annualRatePct : 0;
  const contributionTiming: ContributionTiming = raw.contributionTiming ?? 'endOfPeriod';

  const totalPeriods = years * periodsPerYear;
  const contributionPerPeriod = monthlyContribution * (12 / periodsPerYear);
  const periodicRate = (annualRatePct / 100) / periodsPerYear;

  let balance = startingBalance;
  let contributed = 0;

  const yearly: CompoundGrowthYearRow[] = [];

  for (let p = 1; p <= totalPeriods; p++) {
    if (contributionTiming === 'startOfPeriod') {
      // Deposit first, then growth.
      balance = balance + contributionPerPeriod;
      contributed += contributionPerPeriod;
      balance = balance * (1 + periodicRate);
    } else {
      // Growth first, then deposit (end-of-period deposits).
      balance = balance * (1 + periodicRate);
      balance = balance + contributionPerPeriod;
      contributed += contributionPerPeriod;
    }

    const isYearEnd = p % periodsPerYear === 0;
    if (isYearEnd) {
      const year = p / periodsPerYear;
      const endBalance = balance;
      const totalContributed = contributed;
      const totalGrowth = endBalance - startingBalance - totalContributed;
      yearly.push({ year, endBalance, totalContributed, totalGrowth });
    }
  }

  const finalBalance = balance;
  const totalContributed = contributed;
  const totalGrowth = finalBalance - startingBalance - totalContributed;

  return {
    inputs: {
      startingBalance,
      monthlyContribution,
      annualRatePct,
      years,
      periodsPerYear,
      contributionTiming,
    },
    finalBalance,
    totalContributed,
    totalGrowth,
    yearly,
  };
}
