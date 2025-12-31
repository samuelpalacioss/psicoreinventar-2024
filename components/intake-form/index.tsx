"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { intakeSchema, stepFields, type IntakeFormData } from "./schema";
import {
  StepTherapyType,
  StepConcerns,
  StepPHQ4,
  StepHealthSupport,
  StepPreviousTherapy,
  StepYourGender,
  StepTherapistPreferences,
  StepCultural,
  StepPayment,
  StepSessionFormat,
  StepRegister,
  CrisisResourcesBanner,
} from "./steps";
import {
  calculatePHQ4Score,
  detectCrisis,
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
} from "./utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  { name: "Therapy Type", component: StepTherapyType },
  { name: "Concerns", component: StepConcerns },
  { name: "How You Feel", component: StepPHQ4 },
  { name: "Well-being", component: StepHealthSupport },
  { name: "Experience", component: StepPreviousTherapy },
  { name: "Your Gender", component: StepYourGender },
  { name: "Preferences", component: StepTherapistPreferences },
  { name: "Cultural", component: StepCultural },
  { name: "Payment", component: StepPayment },
  { name: "Format", component: StepSessionFormat },
  { name: "Register", component: StepRegister },
];

export function IntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showCrisis, setShowCrisis] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    mode: "onChange",
    defaultValues: {
      concerns: [],
      availability: [],
      phq4: { interest: 0, depressed: 0, anxious: 0, worry: 0 },
      language: "english",
    },
  });

  // Load saved draft on mount
  useEffect(() => {
    const draft = loadFormDraft();
    if (draft) {
      form.reset(draft.data as IntakeFormData);
      setStep(draft.step);
    }
  }, [form]);

  // Save draft on form changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      saveFormDraft(data as Partial<IntakeFormData>, step);
    });
    return () => subscription.unsubscribe();
  }, [form, step]);

  // Check for crisis indicators
  useEffect(() => {
    const subscription = form.watch((data) => {
      const concerns = data.concerns || [];
      const phq4 = data.phq4;

      if (phq4) {
        const { score } = calculatePHQ4Score(phq4 as IntakeFormData["phq4"]);
        const crisis = detectCrisis(concerns as string[], score);
        setShowCrisis(crisis.isCrisis);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const validateStep = async () => {
    const fields = stepFields[step];
    if (!fields || fields.length === 0) return true;
    const result = await form.trigger(fields as any);
    return result;
  };

  const next = async () => {
    const valid = await validateStep();
    if (valid && step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const back = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);

    try {
      // Calculate PHQ-4 score for the submission
      const phq4Result = calculatePHQ4Score(data.phq4);

      // Prepare submission data
      const submissionData = {
        ...data,
        phq4Score: phq4Result.score,
        phq4Severity: phq4Result.severity,
        submittedAt: new Date().toISOString(),
      };

      // TODO: Send to API
      console.log("Form submitted:", submissionData);

      // Clear the draft
      clearFormDraft();

      // Redirect to results page with query params or store in session
      router.push("/get-matched/results");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStep = STEPS[step].component;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">{STEPS[step].name}</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Crisis banner */}
      {showCrisis && <CrisisResourcesBanner />}

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CurrentStep form={form} />

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
          <Button
            type="button"
            variant="ghost"
            onClick={back}
            disabled={step === 0}
            className={cn("text-gray-600 hover:text-gray-900", step === 0 && "invisible")}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={next}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
            >
              {isSubmitting ? "Finding your matches..." : "Find My Therapist"}
            </Button>
          )}
        </div>
      </form>

      {/* Save indicator */}
      <p className="text-center text-sm text-gray-400 mt-6">Your progress is automatically saved</p>
    </div>
  );
}

export default IntakeForm;
