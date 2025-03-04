import Container from "./container";
import { Icons } from "./icons";
import Newsletter from "./newsletter";
import { Mail, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

const navigation = {
  company: [
    { name: "About Us", href: "/" },
    { name: "Our Team", href: "/" },
    { name: "Join Our Team", href: "/" },
  ],
  services: [
    { name: "Individual Therapy", href: "/" },
    { name: "Couple Therapy", href: "/" },
    { name: "Teen Therapy", href: "/" },
  ],
  usefulLinks: [
    { name: "Find a Therapist", href: "/" },
    { name: "FAQ", href: "/" },
    { name: "How It Works", href: "/" },
    { name: "Resources", href: "/" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900">
      <Container>
        <div className="pb-8 pt-20 sm:pt-24 lg:pt-32">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="grid grid-cols-2 gap-8 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-white">Services</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.services.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm/6 text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-white">Useful Links</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.usefulLinks.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm/6 text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-white">Company</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.company.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm/6 text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-white">Contact Us</h3>
                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start text-sm/6 ">
                      <Mail className="mr-2 h-5 w-5 text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-gray-300">Write us</p>
                        <p className="text-gray-400">We answer in 24h</p>
                      </div>
                    </li>
                    <li className="flex items-start text-sm/6 ">
                      <Phone className="mr-2 h-5 w-5 text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-gray-300">Call us</p>
                        <p className="text-gray-400">Mon-Fri: 9:00-18:00</p>
                      </div>
                    </li>
                    <li className="flex items-start text-sm/6 ">
                      <MessageCircle className="mr-2 h-5 w-5 text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-gray-300">WhatsApp</p>
                        <p className="text-gray-400">Mon-Fri: 9:00-18:00</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-10 xl:mt-0">
              <Newsletter />
            </div>
          </div>
          <div className="md:flex md:items-center md:justify-between mt-16 text-sm/6 text-gray-400 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
            <div className="flex items-center gap-x-2 md:order-2">
              <span>Made with</span>
              <Icons.heart className="h-4 w-4 animate-pulse" />
              <span>for mental well-being</span>
            </div>
            <p className="mt-8 md:order-1 md:mt-0">
              &copy; {new Date().getFullYear()} Psicoreinventar. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
