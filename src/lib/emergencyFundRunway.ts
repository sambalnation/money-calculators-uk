export type EmergencyFundRunwayInputs = {
  /** Liquid cash available for the emergency fund. */
  emergencyFundBalance: number;
  /** Expected monthly spending you must cover (rent/mortgage, bills, food, etc.). */
  monthlyEssentialSpending: number;
  /** Expected monthly income while in an emergency (benefits/side income/etc.). */
  monthlyIncomeDuringEmergency: number;
};

export type EmergencyFundRunwayResult = {
  inputs: EmergencyFundRunwayInputs;
  /** Net burn per month = spending - income. */
  netMonthlyBurn: number;
  /** Exact runway in months (can be Infinity). */
  runwayMonths: number;
  /** Exact runway in weeks (can be Infinity). */
  runwayWeeks: number;
};

function clampNonNegative(n: number) {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Educational emergency-fund runway model.
 *
 * Notes:
 * - Uses simple division with monthly averages (no compounding, no interest).
 * - Treats income during the emergency as offsetting spending.
 */
export function computeEmergencyFundRunway(raw: EmergencyFundRunwayInputs): EmergencyFundRunwayResult {
  const emergencyFundBalance = clampNonNegative(raw.emergencyFundBalance);
  const monthlyEssentialSpending = clampNonNegative(raw.monthlyEssentialSpending);
  const monthlyIncomeDuringEmergency = clampNonNegative(raw.monthlyIncomeDuringEmergency);

  const netMonthlyBurn = monthlyEssentialSpending - monthlyIncomeDuringEmergency;

  const runwayMonths = netMonthlyBurn <= 0 ? Number.POSITIVE_INFINITY : emergencyFundBalance / netMonthlyBurn;
  const runwayWeeks = runwayMonths === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : runwayMonths * (52 / 12);

  return {
    inputs: { emergencyFundBalance, monthlyEssentialSpending, monthlyIncomeDuringEmergency },
    netMonthlyBurn,
    runwayMonths,
    runwayWeeks,
  };
}
