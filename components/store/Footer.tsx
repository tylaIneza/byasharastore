import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#0F172A] text-slate-400">
      <div className="container-base py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <span className="text-white font-black text-xs">BY</span>
              </div>
              <span className="font-black text-xl text-white">
                BY<span className="text-[#60A5FA]">ASHARA</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Rwanda & Eastern DRC's trusted wholesale electronics supplier. Best prices, verified products, fast delivery.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Youtube, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#2563EB] flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                { label: "Cart", href: "/cart" },
                { label: "Checkout", href: "/checkout" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#60A5FA] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Delivery Info</h3>
            <p className="text-sm leading-relaxed mb-3">
              Delivery fee is calculated by distance from our nearest branch. Orders confirmed within 24 hours.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="text-[#60A5FA] font-semibold">Our branches:</li>
              <li>• Nyabugogo, Kigali</li>
              <li>• Mahoko, Rubavu</li>
              <li className="mt-2 text-[#60A5FA] font-semibold">Delivery rate:</li>
              <li>• 1,000 RWF per 10 km</li>
              <li>• (e.g. 20 km = 2,000 RWF)</li>
              <li className="text-emerald-400">• Free above 500,000 RWF</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#2563EB] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-xs mb-0.5">HQ — Nyabugogo, Kigali</p>
                  <span>KN 4 Ave, Kigali, Rwanda</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-xs mb-0.5">Rubavu Branch</p>
                  <span>Rubavu, Western Province, Rwanda</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                <span>+250 782 545 277</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                <span>info@byashara.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {year} BYASHARA STORE. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
