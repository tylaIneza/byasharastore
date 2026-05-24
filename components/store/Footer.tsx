"use client";
import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useLanguageStore } from "@/store/language";

export default function Footer() {
  const { t } = useLanguageStore();
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
            <p className="text-sm leading-relaxed mb-5">{t.footer.tagline}</p>
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
            <h3 className="text-white font-semibold mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: t.nav.home, href: "/" },
                { label: t.nav.products, href: "/products" },
                { label: t.nav.cart, href: "/cart" },
                { label: t.checkout.title, href: "/checkout" },
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
            <h3 className="text-white font-semibold mb-4">{t.footer.delivery}</h3>
            <p className="text-sm leading-relaxed mb-3">{t.footer.deliveryInfo}</p>
            <ul className="space-y-2 text-sm">
              <li className="text-[#60A5FA] font-semibold">{t.footer.branches}:</li>
              <li>• Nyabugogo, Kigali</li>
              <li>• Mahoko, Rubavu</li>
              <li className="mt-2 text-[#60A5FA] font-semibold">{t.footer.rate}:</li>
              <li>• 1,500 RWF / 10 km</li>
              <li>• (e.g. 20 km = 3,000 RWF)</li>
              <li className="text-emerald-400">• {t.footer.freeAbove}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.footer.contact}</h3>
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

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {year} BYASHARA STORE. {t.footer.rights}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dbi-ecommerce-trust-seal.png"
            alt="DBI Rwanda E-Commerce Trust Seal"
            width={72}
            height={72}
            className="opacity-90 hover:opacity-100 transition-opacity"
          />
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">{t.footer.privacyPolicy}</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">{t.footer.termsOfService}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
