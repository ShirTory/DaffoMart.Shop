import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/store/ProductCard";
import HeroSlider from "@/components/store/HeroSlider";
import CopyCode from "@/components/store/CopyCode";
import { getActiveProducts, getBanners, getCategories, getOffers, getSettings } from "@/server/queries";
import { taka } from "@/lib/format";
export const revalidate = 60;

const Section = ({ title, children, href, emoji }: { title: string; children: React.ReactNode; href?: string; emoji?: string }) => (
  <section className="mt-8 sm:mt-10">
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl md:text-2xl">
        {emoji && <span className="mr-1.5">{emoji}</span>}
        {title}
      </h2>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-primary hover:underline">
          View all →
        </Link>
      )}
    </div>
    {children}
  </section>
);

/** Horizontal product scroller (marketplace style) */
const HScroll = ({ children }: { children: React.ReactNode }) => (
  <div className="scroll-thin -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
    {children}
  </div>
);

const CardWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[42vw] max-w-[180px] shrink-0 sm:w-auto sm:max-w-none">{children}</div>
);

export default async function Home() {
  const [products, categories, banners, offers, settings] = await Promise.all([
    getActiveProducts(), getCategories(), getBanners(), getOffers(), getSettings(),
  ]);
  const medCats = categories.filter((c) => c.kind === "medicine");
  const medIds = new Set(medCats.map((c) => c.id));
  const meds = products.filter((p) => medIds.has(p.categoryId));
  const shopCats = categories.filter((c) => c.kind !== "medicine" && c.active !== false);
  const groc = products.filter((p) => !medIds.has(p.categoryId));
  const featured = groc.filter((p) => p.featured).slice(0, 12);
  const fresh = [...groc].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12);
  const sale = products.filter((p) => p.oldPrice && p.oldPrice > p.price).slice(0, 12);
  const best = [...groc].sort((a, b) => b.sold - a.sold).slice(0, 12);
  const posterOffers = offers.filter((o) => o.image).slice(0, 4);

  return (
    <>
      {/* Admin-managed promotional carousel — headings stay outside images */}
      {banners.length > 0 ? (
        <HeroSlider banners={banners} />
      ) : (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-orange-500 p-8 text-white sm:p-12">
          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-semibold text-white/80">{settings.storeName}</p>
            <h1 className="mt-2 whitespace-pre-line text-3xl font-extrabold leading-tight sm:text-4xl">{settings.heroTitle}</h1>
            <p className="mt-2 text-white/85">{settings.heroSubtitle || settings.tagline}</p>
            <Link href="/products" className="mt-5 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-bold text-red-700 shadow hover:bg-gray-50">
              {settings.heroCta || "Shop now"}
            </Link>
          </div>
        </section>
      )}

      {/* Trust strip */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {(settings.features?.length ? settings.features : [
          { icon: "⚡", title: "Fast delivery", text: "1–2 hours in your area" },
          { icon: "✅", title: "Quality products", text: "Fresh & verified" },
          { icon: "💬", title: "Support", text: "Call or WhatsApp us" },
          { icon: "💵", title: "Easy payment", text: "COD · bKash · Nagad" },
        ]).slice(0, 4).map((f, k) => (
          <div key={k} className="flex items-center gap-2.5 rounded-xl border bg-white px-3 py-3 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-lg">{f.icon}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">{f.title}</p>
              <p className="truncate text-[11px] text-gray-500">{f.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Horizontal shop-by-category */}
      {shopCats.length > 0 && (
        <Section title="Shop by category">
          <div className="scroll-thin -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {shopCats.map((c) => (
              <Link
                key={c.id}
                href={`/products?cat=${c.id}`}
                className="group flex w-[88px] shrink-0 flex-col items-center sm:w-[100px]"
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-white shadow-sm ring-1 ring-gray-100 transition group-hover:ring-primary sm:h-24 sm:w-24">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-3xl">{c.emoji || "🛒"}</span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-center text-xs font-semibold text-gray-800 group-hover:text-primary">{c.name}</p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Image offer posters from admin offers (only those with images) */}
      {posterOffers.length > 0 && (
        <Section title="Special deals" emoji="🔥">
          <div className="scroll-thin -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {posterOffers.map((o) => (
              <div key={o.id} className="relative w-[85vw] max-w-md shrink-0 overflow-hidden rounded-2xl border bg-white shadow-sm sm:w-auto sm:max-w-none">
                <div className="relative aspect-[16/7] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.image!} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {o.badge && <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">{o.badge}</span>}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900">{o.title}</h3>
                  {o.description && <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{o.description}</p>}
                  {o.code && (
                    <div className="mt-2 flex items-center gap-2">
                      <CopyCode code={o.code} />
                      {o.minOrder > 0 && <span className="text-xs text-gray-400">Min {taka(o.minOrder)}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Text-only offers without images still listed compactly */}
      {offers.filter((o) => !o.image).length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {offers.filter((o) => !o.image).slice(0, 6).map((o) => (
            <div key={o.id} className="flex items-center gap-3 rounded-xl border bg-gradient-to-r from-red-50 to-white p-3 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-sm font-extrabold text-white">
                {o.discountType === "percent" ? `${o.discountValue}%` : taka(o.discountValue)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{o.title}</p>
                {o.code && <CopyCode code={o.code} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {settings.showMedicine && meds.length > 0 && (
        <Section title={settings.medicineTitle || "Medicine"} href="/medicine" emoji="💊">
          <HScroll>
            {meds.slice(0, 10).map((p) => (
              <CardWrap key={p.id}><ProductCard p={p} whatsapp={settings.whatsapp} /></CardWrap>
            ))}
          </HScroll>
        </Section>
      )}

      {sale.length > 0 && (
        <Section title="Hot deals" href="/products?sale=1" emoji="🔥">
          <HScroll>
            {sale.map((p) => (
              <CardWrap key={p.id}><ProductCard p={p} whatsapp={settings.whatsapp} /></CardWrap>
            ))}
          </HScroll>
        </Section>
      )}

      {featured.length > 0 && (
        <Section title="Recommended for you" href="/products?featured=1" emoji="⭐">
          <HScroll>
            {featured.map((p) => (
              <CardWrap key={p.id}><ProductCard p={p} whatsapp={settings.whatsapp} /></CardWrap>
            ))}
          </HScroll>
        </Section>
      )}

      {best.some((p) => p.sold > 0) && (
        <Section title="Hot & trending" href="/products?sort=popular" emoji="📈">
          <HScroll>
            {best.map((p) => (
              <CardWrap key={p.id}><ProductCard p={p} whatsapp={settings.whatsapp} /></CardWrap>
            ))}
          </HScroll>
        </Section>
      )}

      <Section title="New arrivals" href="/products" emoji="✨">
        <HScroll>
          {fresh.map((p) => (
            <CardWrap key={p.id}><ProductCard p={p} whatsapp={settings.whatsapp} /></CardWrap>
          ))}
        </HScroll>
      </Section>

      {products.length === 0 && (
        <p className="mt-10 rounded-2xl border bg-white p-10 text-center text-gray-500">Products are coming soon.</p>
      )}
    </>
  );
}
