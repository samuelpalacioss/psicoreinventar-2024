import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQItem } from "@/src/types";

type FAQHomepageProps = {
  title?: string;
  subtitle?: string;
  faqItems: FAQItem[];
};

export default function FAQHomepage({ title, subtitle, faqItems }: FAQHomepageProps) {
  return (
    <div className="px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl text-gray-800 mb-2">
          {title || "Frequently asked questions"}
        </h2>
        {subtitle && <p className="text-base sm:text-lg text-gray-600">{subtitle}</p>}
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
