import { Mail, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function PreFooter() {
  return (
    <section className="w-full py-12 bg-gray-50">
      <div className="grid md:grid-cols-4 gap-4 items-start">
        <div className="text-left">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">psicoireinventar.</h2>
          <p className="text-gray-500 flex items-center gap-2">
            We&apos;re here if you need us
            <span aria-label="hand emoji">👋</span>
          </p>
        </div>

        <div className="flex items-start gap-4 p-4">
          <Link href="/contact" className="bg-indigo-100 p-3 rounded-full">
            <Mail className="w-6 h-6 text-indigo-400" />
          </Link>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">Write us</h3>
            <p className="text-gray-500">We answer in 24h</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4">
          <Link href="/contact" className="bg-indigo-100 p-3 rounded-full">
            <Phone className="w-6 h-6 text-indigo-400" />
          </Link>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">Call us</h3>
            <p className="text-gray-500">Mon-Fri: 9:00-18:00</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4">
          <Link href="/contact" className="bg-indigo-100 p-3 rounded-full">
            <MessageCircle className="w-6 h-6 text-indigo-400" />
          </Link>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">WhatsApp</h3>
            <p className="text-gray-500">Mon-Fri: 9:00-18:00</p>
          </div>
        </div>
      </div>
    </section>
  );
}
