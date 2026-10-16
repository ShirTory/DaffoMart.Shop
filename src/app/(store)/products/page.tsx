import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/store/ProductCard";
import { getActiveProducts, getCategories, getSettings } from "@/server/queries";
export const metadata: Metadata = { title: "All Products" };
const PER = 24;

type SP = { q?: string; cat?: string; sort?: string; max?: string; sale?: string; featured?: string; page?: string };

const OVERLAY: Record<string, string> = {
  dark: "bg-black/50",
  medium: "bg-black/35",
  light: "bg-black/20",
  none: "bg-transparent",
};
const HEIGHT: Record<string, string> = {
  sm: "h-28 sm:h-32 md:h-36",
  md: "h-36 sm:h-44 md:h-52",
  lg: "h-44 sm:h-56 md:h-64",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { q = "", cat = "", sort = "", max = "", sale = "", featured = "" } = sp;
  const page = Math.max(1, Number(sp.page) || 1);
  const [all, categories, settings] = await Promise.all([getActiveProducts(), getCategories(), getSettings()]);
  let list = all.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) &&
      (!cat || p.categoryId === cat) &&
      (!max || p.price <= Number(max)) &&
      (!sale || (p.oldPrice && p.oldPrice > p.price)) &&
      (!featured || p.featured)
  );
  if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "popular") list.sort((a, b) => b.sold - a.sold);
  else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PER));
  list = list.slice((page - 1) * PER, page * PER);
  const link = (o: Record<string, string>) => {
    const p = new URLSearchParams(
      Object.entries({ q, cat, sort, max, sale, featured, ...o }).filter(([, v]) => v) as [string, string][]
    );
    const s = p.toString();
    return `/products${s ? `?${s}` : ""}`;
  };
  const activeCat = cat ? categories.find((c) => c.id === cat) : null;
  const heading = sale ? "Offers & Discounts" : featured ? "Featured Products" : activeCat ? activeCat.name : "All Products";
  const chip = (active: boolean) =>
    `rounded-lg px-3 py-1.5 transition ${active ? "bg-primary text-white" : "bg-gray-50 text-gray-700 hover:bg-primary-soft"}`;

  const emptyTitle = settings.emptyStateTitle || "No products found";
  const emptyText = settings.emptyStateText || "Try a different search or filter. Fresh stock arrives daily.";
  const hasCover = !!(activeCat?.coverImage || activeCat?.description);
  const heightCls = HEIGHT[activeCat?.coverHeight || "md"] || HEIGHT.md;
  const overlayCls = OVERLAY[activeCat?.coverOverlay || "medium"] || OVERLAY.medium;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit space-y-6 rounded-2xl border bg-white p-5 text-sm shadow-card lg:sticky lg:top-40">
        <div>
          <h3 className="mb-3 font-bold">Categories</h3>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            <Link href={link({ cat: "", page: "" })} className={chip(!cat)}>All</Link>
            {categories.map((c) => (
              <Link key={c.id} href={link({ cat: c.id, page: "" })} className={chip(cat === c.id)}>
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Max price</h3>
          <div className="flex flex-wrap gap-2">
            {["", "100", "300", "500", "1000"].map((m) => (
              <Link key={m} href={link({ max: m, page: "" })} className={chip(max === m)}>
                {m ? `৳${m}` : "Any"}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Sort by</h3>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {[
              ["", "Newest"],
              ["price_asc", "Price: low to high"],
              ["price_desc", "Price: high to low"],
              ["popular", "Most popular"],
            ].map(([v, l]) => (
              <Link key={v} href={link({ sort: v, page: "" })} className={chip(sort === v)}>{l}</Link>
            ))}
          </div>
        </div>
      </aside>

      <section>
        {activeCat && hasCover && (
          <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-sm">
            {activeCat.coverImage ? (
              <div className={`relative ${heightCls}`}>
                <Image src={activeCat.coverImage} alt={activeCat.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 900px" priority />
                <div className={`absolute inset-0 ${overlayCls}`} />
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Category</p>
                  <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl">
                    {activeCat.emoji} {activeCat.name}
                  </h1>
                  {activeCat.description && (
                    <p className="mt-1 max-w-xl text-sm text-white/90 line-clamp-2 sm:line-clamp-3">{activeCat.description}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Category</p>
                <h1 className="text-xl font-extrabold sm:text-2xl">{activeCat.emoji} {activeCat.name}</h1>
                {activeCat.description && <p className="mt-1 max-w-xl text-sm text-white/85">{activeCat.description}</p>}
              </div>
            )}
          </div>
        )}

        {!(activeCat && hasCover && activeCat.coverImage) && (
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {heading}
              {q && <span className="ml-2 text-base font-normal text-gray-500">for “{q}”</span>}
            </h1>
            <p className="text-sm text-gray-500">{total} product{total === 1 ? "" : "s"}</p>
          </div>
        )}
        {activeCat?.coverImage && <p className="mb-3 text-sm text-gray-500">{total} product{total === 1 ? "" : "s"}</p>}

        {list.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-3xl">
              {settings.emptyStateIcon || "🔍"}
            </div>
            <p className="text-lg font-bold text-gray-900">{emptyTitle}</p>
            <p className="mt-1.5 text-sm text-gray-500">{emptyText}</p>
            <Link href="/products" className="btn-primary mt-5 inline-flex">Clear filters</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} whatsapp={settings.whatsapp} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={link({ page: String(n) })}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold ${
                  n === page ? "border-primary bg-primary text-white" : "bg-white hover:bg-primary-soft"
                }`}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </section>
    </div>
  );
}
