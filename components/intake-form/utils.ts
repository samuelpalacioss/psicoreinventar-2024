import type { IntakeFormData } from "./schema";

// PHQ-4 scoring (0-12 scale)
export function calculatePHQ4Score(phq4: {
  interest: number;
  depressed: number;
  anxious: number;
  worry: number;
}): { score: number; severity: "minimal" | "mild" | "moderate" | "severe" } {
  const score = phq4.interest + phq4.depressed + phq4.anxious + phq4.worry;

  let severity: "minimal" | "mild" | "moderate" | "severe" = "minimal";
  if (score >= 3) severity = "mild";
  if (score >= 6) severity = "moderate";
  if (score >= 9) severity = "severe";

  return { score, severity };
}

// Crisis detection
export function detectCrisis(
  concerns: string[],
  phq4Score: number
): { isCrisis: boolean; level: "high" | "medium" | "low" } {
  const crisisKeywords = ["self-harm", "suicide", "hurt myself", "end my life"];
  const hasCrisisKeyword = concerns.some((c) =>
    crisisKeywords.some((k) => c.toLowerCase().includes(k))
  );

  if (hasCrisisKeyword || phq4Score >= 9) {
    return { isCrisis: true, level: "high" };
  }

  if (phq4Score >= 6) {
    return { isCrisis: false, level: "medium" };
  }

  return { isCrisis: false, level: "low" };
}

// Therapist type for matching (simplified)
export interface TherapistProfile {
  id: string;
  name: string;
  gender: string;
  specialties: string[];
  formats: ("virtual" | "in-person")[];
  insurances: string[];
  lgbtqAffirming: boolean;
  religion?: string;
  languages: string[];
}

// Simple matching score (0-100)
export function calculateMatchScore(
  therapist: TherapistProfile,
  preferences: IntakeFormData
): number {
  let score = 50; // Base score

  // Required criteria (return 0 if not met)
  if (preferences.sessionFormat !== "either") {
    const format = preferences.sessionFormat as "virtual" | "in-person";
    if (!therapist.formats.includes(format)) return 0;
  }

  if (
    preferences.paymentMethod === "insurance" &&
    preferences.insuranceProvider
  ) {
    if (!therapist.insurances.includes(preferences.insuranceProvider)) return 0;
  }

  // Weighted preferences
  if (
    preferences.therapistGender &&
    preferences.therapistGender !== "no-preference" &&
    therapist.gender === preferences.therapistGender
  ) {
    score += 15;
  }

  if (preferences.lgbtqAffirming === "yes" && therapist.lgbtqAffirming) {
    score += 15;
  }

  if (preferences.lgbtqAffirming === "preferred" && therapist.lgbtqAffirming) {
    score += 10;
  }

  // Match concerns to specialties
  const matchedSpecialties = preferences.concerns.filter((c) =>
    therapist.specialties.some(
      (s) => s.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(s.toLowerCase())
    )
  );
  score += matchedSpecialties.length * 5;

  // Language match
  if (
    preferences.language !== "english" &&
    therapist.languages.includes(preferences.language)
  ) {
    score += 10;
  }

  // Religion match (if important)
  if (
    preferences.religion?.importance === "very" &&
    preferences.religion.value &&
    therapist.religion === preferences.religion.value
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

// Form persistence
const STORAGE_KEY = "intake-form-draft";

export function saveFormDraft(data: Partial<IntakeFormData>, step: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step, savedAt: Date.now() }));
}

export function loadFormDraft(): { data: Partial<IntakeFormData>; step: number } | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    // Expire after 24 hours
    if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
      clearFormDraft();
      return null;
    }
    return { data: parsed.data, step: parsed.step };
  } catch {
    return null;
  }
}

export function clearFormDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
