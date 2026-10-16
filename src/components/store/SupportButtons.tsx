"use client";
import type { StoreSettings } from "@/lib/types";

export default function SupportButtons({ settings }: { settings: StoreSettings }) {
  const phone = (settings.phone || "").replace(/\s/g, "");
  const wa = (settings.whatsapp || "").replace(/\D/g, "");
  const showCall = settings.showSupportCall !== false && phone;
  const showWa = settings.showSupportWa !== false && wa;
  if (!showCall && !showWa) return null;
  const callLabel = settings.supportCallLabel || "Call Now";
  const waLabel = settings.supportWaLabel || "WhatsApp";
  const waMsg = encodeURIComponent("Hi DaffoMart, I need help with my order.");

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 md:bottom-5">
      {showWa && (
        <a
          href={`https://wa.me/${wa}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={waLabel}
          className="flex items-center gap-2 rounded-full bg-[#25D366] px-3.5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z" />
          </svg>
          <span className="hidden sm:inline">{waLabel}</span>
        </a>
      )}
      {showCall && (
        <a
          href={`tel:${phone}`}
          aria-label={callLabel}
          className="flex items-center gap-2 rounded-full bg-primary px-3.5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
          </svg>
          <span className="hidden sm:inline">{callLabel}</span>
        </a>
      )}
    </div>
  );
}
