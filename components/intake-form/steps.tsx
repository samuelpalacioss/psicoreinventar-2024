"use client";

import { UseFormReturn } from "react-hook-form";
import type { IntakeFormData } from "./schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SignupForm from "@/components/signup-form";
import { cn } from "@/lib/utils";

interface StepProps {
  form: UseFormReturn<IntakeFormData>;
}

// ============ STEP 1: Therapy Type ============
const THERAPY_TYPES = [
  {
    value: "individual",
    label: "Individual therapy",
    desc: "One-on-one sessions for personal growth",
  },
  { value: "couples", label: "Couples therapy", desc: "Work on your relationship together" },
  { value: "teen", label: "Teen therapy", desc: "Support for adolescents (13-17)" },
];

export function StepTherapyType({ form }: StepProps) {
  const selectedType = form.watch("therapyType");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
          What type of therapy are you seeking?
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          Choose the option that best fits your needs right now.
        </p>
      </div>

      <RadioGroup
        value={selectedType}
        onValueChange={(v) => form.setValue("therapyType", v as IntakeFormData["therapyType"])}
        className="space-y-3"
      >
        {THERAPY_TYPES.map((type) => (
          <label
            key={type.value}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors",
              "border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50",
              selectedType === type.value && "border-indigo-300 bg-indigo-50/30"
            )}
          >
            <RadioGroupItem value={type.value} className="mt-1" />
            <div>
              <span className="text-lg font-medium text-gray-900">{type.label}</span>
              <p className="text-sm text-gray-500 mt-0.5">{type.desc}</p>
            </div>
          </label>
        ))}
      </RadioGroup>
      {form.formState.errors.therapyType && (
        <p className="text-sm text-red-600 mt-2">{form.formState.errors.therapyType.message}</p>
      )}
    </div>
  );
}

// ============ STEP 2: Concerns ============
const CONCERNS = [
  "Anxiety or worry",
  "Depression or low mood",
  "Relationship issues",
  "Trauma or past experiences",
  "Life transitions",
  "Stress or burnout",
  "Self-esteem",
  "Grief or loss",
];

export function StepConcerns({ form }: StepProps) {
  const selectedConcerns = form.watch("concerns") || [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-1">
          What brings you here?
        </h3>
        <p className="text-gray-600 leading-relaxed text-sm">
          Select all that apply. This helps us find the right match.
        </p>
      </div>

      <div className="space-y-2">
        {CONCERNS.map((concern) => {
          const isChecked = selectedConcerns.includes(concern);
          return (
            <label
              key={concern}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors",
                "border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50",
                isChecked && "border-indigo-300 bg-indigo-50/30"
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => {
                  const current = form.getValues("concerns") || [];
                  form.setValue(
                    "concerns",
                    checked ? [...current, concern] : current.filter((c) => c !== concern),
                    { shouldValidate: true }
                  );
                }}
              />
              <span className="text-gray-900">{concern}</span>
            </label>
          );
        })}
      </div>

      <div>
        <Input
          placeholder="Other (please specify)"
          {...form.register("otherConcern")}
          className="bg-white"
        />
      </div>

      {form.formState.errors.concerns && (
        <p className="text-sm text-red-600 mt-2">{form.formState.errors.concerns.message}</p>
      )}
    </div>
  );
}

// ============ STEP 3: PHQ-4 Questions ============
const PHQ4_QUESTIONS = [
  { key: "interest", text: "Little interest or pleasure in doing things" },
  { key: "depressed", text: "Feeling down, depressed, or hopeless" },
  { key: "anxious", text: "Feeling nervous, anxious, or on edge" },
  { key: "worry", text: "Not being able to stop or control worrying" },
];

const PHQ4_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

export function StepPHQ4({ form }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
          Over the past 2 weeks, how often have you experienced...
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          Your answers help us understand your current state.
        </p>
      </div>

      <div className="space-y-6">
        {PHQ4_QUESTIONS.map((q) => {
          const value = form.watch(`phq4.${q.key as keyof IntakeFormData["phq4"]}`);
          return (
            <div key={q.key} className="space-y-3">
              <p className="text-gray-900 font-medium">{q.text}</p>
              <RadioGroup
                value={value?.toString()}
                onValueChange={(v) =>
                  form.setValue(`phq4.${q.key as keyof IntakeFormData["phq4"]}`, parseInt(v))
                }
                className="flex flex-wrap gap-2"
              >
                {PHQ4_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                      "border border-gray-200 hover:border-gray-300",
                      value === opt.value && "border-indigo-300 bg-indigo-50/30"
                    )}
                  >
                    <RadioGroupItem value={opt.value.toString()} />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ STEP 4: Health & Support ============
export function StepHealthSupport({ form }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
          A little more about your well-being
        </h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-gray-900 font-medium">
            How would you rate your physical health?
          </Label>
          <RadioGroup
            value={form.watch("physicalHealth")}
            onValueChange={(v) =>
              form.setValue("physicalHealth", v as IntakeFormData["physicalHealth"])
            }
            className="flex flex-wrap gap-2 mt-3"
          >
            {["excellent", "good", "fair", "poor"].map((opt) => (
              <label
                key={opt}
                className={cn(
                  "px-4 py-2 rounded-lg cursor-pointer transition-colors capitalize",
                  "border border-gray-200 hover:border-gray-300",
                  form.watch("physicalHealth") === opt && "border-indigo-300 bg-indigo-50/30"
                )}
              >
                <RadioGroupItem value={opt} className="sr-only" />
                <span>{opt}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-gray-900 font-medium">
            How would you describe your support system?
          </Label>
          <RadioGroup
            value={form.watch("supportSystem")}
            onValueChange={(v) =>
              form.setValue("supportSystem", v as IntakeFormData["supportSystem"])
            }
            className="flex flex-wrap gap-2 mt-3"
          >
            {[
              { value: "strong", label: "Strong support" },
              { value: "some", label: "Some support" },
              { value: "limited", label: "Limited support" },
              { value: "isolated", label: "Feeling isolated" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "px-4 py-2 rounded-lg cursor-pointer transition-colors",
                  "border border-gray-200 hover:border-gray-300",
                  form.watch("supportSystem") === opt.value && "border-indigo-300 bg-indigo-50/30"
                )}
              >
                <RadioGroupItem value={opt.value} className="sr-only" />
                <span>{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

// ============ STEP 5: Previous Therapy ============
export function StepPreviousTherapy({ form }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
          Have you been in therapy before?
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6">
          This helps us understand your experience level.
        </p>
      </div>

      <RadioGroup
        value={form.watch("previousTherapy")}
        onValueChange={(v) =>
          form.setValue("previousTherapy", v as IntakeFormData["previousTherapy"])
        }
        className="space-y-3"
      >
        {[
          {
            value: "yes-helpful",
            label: "Yes, and it was helpful",
            desc: "I had a positive experience",
          },
          {
            value: "yes-not-helpful",
            label: "Yes, but it wasn't helpful",
            desc: "It didn't work for me",
          },
          { value: "no", label: "No, this is my first time", desc: "I'm new to therapy" },
        ].map((opt) => (
          <label
            key={opt.value}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors",
              "border border-gray-200 hover:border-gray-300",
              form.watch("previousTherapy") === opt.value && "border-indigo-300 bg-indigo-50/30"
            )}
          >
            <RadioGroupItem value={opt.value} className="mt-1" />
            <div>
              <span className="text-lg font-medium text-gray-900">{opt.label}</span>
              <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

// ============ STEP 6: Your Gender ============
const GENDERS = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export function StepYourGender({ form }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">What is your gender?</h3>
      </div>

      <RadioGroup
        value={form.watch("gender")}
        onValueChange={(v) => form.setValue("gender", v, { shouldValidate: true })}
        className="space-y-3"
      >
        {GENDERS.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors",
              "border border-gray-200 hover:border-gray-300",
              form.watch("gender") === opt.value && "border-indigo-300 bg-indigo-50/30"
            )}
          >
            <RadioGroupItem value={opt.value} />
            <span className="text-lg font-medium text-gray-900">{opt.label}</span>
          </label>
        ))}
      </RadioGroup>
      {form.formState.errors.gender && (
        <p className="text-sm text-red-600 mt-2">{form.formState.errors.gender.message}</p>
      )}
    </div>
  );
}

// ============ STEP 7: Therapist Preferences ============
export function StepTherapistPreferences({ form }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
          Therapist preferences
        </h3>
        <p className="text-gray-600 leading-relaxed">
          These are optional but can help with your comfort.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-gray-900 font-medium">Therapist gender preference</Label>
          <RadioGroup
            value={form.watch("therapistGender") || ""}
            onValueChange={(v) => form.setValue("therapistGender", v)}
            className="flex flex-wrap gap-2 mt-3"
          >
            {[{ value: "no-preference", label: "No preference" }, ...GENDERS.slice(0, 3)].map(
              (opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "px-4 py-2 rounded-lg cursor-pointer transition-colors",
                    "border border-gray-200 hover:border-gray-300",
                    form.watch("therapistGender") === opt.value &&
                      "border-indigo-300 bg-indigo-50/30"
                  )}
                >
                  <RadioGroupItem value={opt.value} className="sr-only" />
                  <span>{opt.label}</span>
                </label>
              )
            )}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-gray-900 font-medium">LGBTQ+ affirming care</Label>
          <RadioGroup
            value={form.watch("lgbtqAffirming") || ""}
            onValueChange={(v) =>
              form.setValue("lgbtqAffirming", v as IntakeFormData["lgbtqAffirming"])
            }
            className="flex flex-wrap gap-2 mt-3"
          >
            {[
              { value: "yes", label: "Yes, this is important" },
              { value: "preferred", label: "Preferred" },
              { value: "no-preference", label: "No preference" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "px-4 py-2 rounded-lg cursor-pointer transition-colors",
                  "border border-gray-200 hover:border-gray-300",
                  form.watch("lgbtqAffirming") === opt.value && "border-indigo-300 bg-indigo-50/30"
                )}
              >
                <RadioGroupItem value={opt.value} className="sr-only" />
                <span>{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

// ============ STEP 8: Cultural & Religion ============
const RELIGIONS = [
  { value: "no-preference", label: "No preference" },
  { value: "christian", label: "Christian" },
  { value: "jewish", label: "Jewish" },
  { value: "muslim", label: "Muslim" },
  { value: "buddhist", label: "Buddhist" },
  { value: "hindu", label: "Hindu" },
  { value: "agnostic-atheist", label: "Agnostic/Atheist" },
  { value: "spiritual", label: "Spiritual but not religious" },
  { value: "other", label: "Other" },
];

export function StepCultural({ form }: StepProps) {
  const religionValue = form.watch("religion.value");

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
          Cultural considerations
        </h3>
        <p className="text-gray-600 leading-relaxed">
          These details help us find a therapist who truly understands you.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-gray-900 font-medium">Cultural background consideration</Label>
          <p className="text-sm text-gray-500 mb-3">
            Is it important that your therapist understands your cultural background?
          </p>
          <RadioGroup
            value={form.watch("culturalImportance") || ""}
            onValueChange={(v) =>
              form.setValue("culturalImportance", v as IntakeFormData["culturalImportance"])
            }
            className="flex flex-wrap gap-2"
          >
            {[
              { value: "yes", label: "Yes, very important" },
              { value: "somewhat", label: "Somewhat important" },
              { value: "not", label: "Not important" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "px-4 py-2 rounded-lg cursor-pointer transition-colors",
                  "border border-gray-200 hover:border-gray-300",
                  form.watch("culturalImportance") === opt.value &&
                    "border-indigo-300 bg-indigo-50/30"
                )}
              >
                <RadioGroupItem value={opt.value} className="sr-only" />
                <span>{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-gray-900 font-medium">Religion or spirituality</Label>
            <Select
              value={religionValue || ""}
              onValueChange={(v) => form.setValue("religion.value", v)}
            >
              <SelectTrigger className="mt-2 bg-white max-w-xs">
                <SelectValue placeholder="Select if relevant..." />
              </SelectTrigger>
              <SelectContent>
                {RELIGIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-gray-900 font-medium">Preferred language</Label>
          <Select
            value={form.watch("language") || "english"}
            onValueChange={(v) => form.setValue("language", v)}
          >
            <SelectTrigger className="mt-2 bg-white max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ============ STEP 9: Payment Method ============
const INSURANCE_PROVIDERS = [
  "Aetna",
  "Blue Cross Blue Shield",
  "Cigna",
  "Humana",
  "Kaiser",
  "Medicare",
  "Medicaid",
  "United Healthcare",
  "Other",
];

export function StepPayment({ form }: StepProps) {
  const paymentMethod = form.watch("paymentMethod");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
          How do you plan to pay?
        </h3>
      </div>

      <RadioGroup
        value={paymentMethod}
        onValueChange={(v) =>
          form.setValue("paymentMethod", v as IntakeFormData["paymentMethod"], {
            shouldValidate: true,
          })
        }
        className="space-y-3"
      >
        {[
          {
            value: "out-of-pocket",
            label: "Out-of-pocket / Self-pay",
            desc: "Pay directly for sessions",
          },
          {
            value: "insurance",
            label: "Insurance",
            desc: "We'll help you find in-network therapists",
          },
        ].map((opt) => (
          <label
            key={opt.value}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors",
              "border border-gray-200 hover:border-gray-300",
              paymentMethod === opt.value && "border-indigo-300 bg-indigo-50/30"
            )}
          >
            <RadioGroupItem value={opt.value} className="mt-1" />
            <div>
              <span className="text-lg font-medium text-gray-900">{opt.label}</span>
              <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
            </div>
          </label>
        ))}
      </RadioGroup>
      {form.formState.errors.paymentMethod && (
        <p className="text-sm text-red-600 mt-2">{form.formState.errors.paymentMethod.message}</p>
      )}

      {paymentMethod === "insurance" && (
        <div className="mt-4 ml-6">
          <Label className="text-gray-700">Insurance provider</Label>
          <Select
            value={form.watch("insuranceProvider") || ""}
            onValueChange={(v) => form.setValue("insuranceProvider", v)}
          >
            <SelectTrigger className="mt-2 bg-white max-w-xs cursor-pointer">
              <SelectValue placeholder="Select your provider..." />
            </SelectTrigger>
            <SelectContent>
              {INSURANCE_PROVIDERS.map((p) => (
                <SelectItem
                  key={p}
                  className="cursor-pointer"
                  value={p.toLowerCase().replace(/\s+/g, "-")}
                >
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// ============ STEP 10: Session Format ============
export function StepSessionFormat({ form }: StepProps) {
  const sessionFormat = form.watch("sessionFormat");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
          How would you like to meet your therapist?
        </h3>
      </div>

      <RadioGroup
        value={sessionFormat}
        onValueChange={(v) =>
          form.setValue("sessionFormat", v as IntakeFormData["sessionFormat"], {
            shouldValidate: true,
          })
        }
        className="space-y-3"
      >
        {[
          {
            value: "virtual",
            label: "Virtual only",
            desc: "Video or phone sessions from anywhere",
          },
          {
            value: "in-person",
            label: "In-person only",
            desc: "Face-to-face at the therapist's office",
          },
          { value: "either", label: "Either works", desc: "Flexible with both options" },
        ].map((opt) => (
          <label
            key={opt.value}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors",
              "border border-gray-200 hover:border-gray-300",
              sessionFormat === opt.value && "border-indigo-300 bg-indigo-50/30"
            )}
          >
            <RadioGroupItem value={opt.value} className="mt-1" />
            <div>
              <span className="text-lg font-medium text-gray-900">{opt.label}</span>
              <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
            </div>
          </label>
        ))}
      </RadioGroup>

      {(sessionFormat === "in-person" || sessionFormat === "either") && (
        <div className="mt-4">
          <Label className="text-gray-700">Your ZIP code</Label>
          <Input
            placeholder="e.g., 90210"
            {...form.register("zipCode")}
            className="mt-2 bg-white max-w-[150px]"
          />
        </div>
      )}
    </div>
  );
}

// ============ STEP 11: Create Account ============
export function StepRegister({ form }: StepProps) {
  const handleGoogleAuth = () => {
    console.log("Google OAuth clicked - questionnaire data in localStorage:", form.getValues());
  };

  return <SignupForm form={form} variant="inline" onGoogleAuth={handleGoogleAuth} />;
}

// Crisis resources banner
export function CrisisResourcesBanner() {
  return (
    <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-5 mb-8">
      <h3 className="font-medium text-rose-900 mb-2">Need immediate support?</h3>
      <p className="text-rose-800 text-sm leading-relaxed mb-3">
        If you&apos;re in crisis or having thoughts of self-harm, please reach out:
      </p>
      <ul className="text-sm text-rose-700 space-y-1">
        <li>
          National Suicide Prevention Lifeline: <strong className="text-rose-900">988</strong>
        </li>
        <li>
          Crisis Text Line: Text <strong className="text-rose-900">HOME</strong> to{" "}
          <strong className="text-rose-900">741741</strong>
        </li>
        <li>
          Emergency: <strong className="text-rose-900">911</strong>
        </li>
      </ul>
      <p className="text-rose-600 text-sm mt-3">
        You can still continue with this form to find ongoing support.
      </p>
    </div>
  );
}
