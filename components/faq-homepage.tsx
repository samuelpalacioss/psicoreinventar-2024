import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqItems = [
  {
    id: "item-1",
    question: "What is Psicoreinventar?",
    answer:
      "Psicoreinventar connects clients with professional therapists. We want to make therapy accessible to everyone and make it easier to find the right therapist.",
  },
  {
    id: "item-2",
    question: "How do I find the right therapist for me?",
    answer: (
      <>
        <p>The right therapist is one who ensures you feel safe and comfortable.</p>
        <p className="mt-2">
          We make it easy to find the right therapist. You can browse and filter our therapists based on your
          specific needs and preferences.
        </p>
      </>
    ),
  },
  {
    id: "item-3",
    question: "How are therapists verified?",
    answer:
      "We conduct an intensive interview process to ensure our therapists have the skills, training, and experience to help you grow.",
  },
  {
    id: "item-4",
    question: "How much will it cost?",
    answer: "Rates are equal for all therapists, the type of session varies the price.",
  },
  {
    id: "item-5",
    question: "How do I schedule an appointment?",
    answer:
      "To schedule an appointment: Select your preferred session type, Choose a therapist that matches your needs, Pick an available time slot from their calendar and Complete the booking process. Once your payment is confirmed, you'll receive all the session details via email.",
  },
];

export default function FAQHomepage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-2">Frequently asked questions</h2>
        <p className="text-base sm:text-lg text-gray-600">
          Getting started with therapy is easier than you think.
        </p>
      </div>
      <Accordion type="multiple" className="w-full">
        {faqItems.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-gray-800 text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-base text-gray-600">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
