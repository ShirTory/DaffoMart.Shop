import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import BottomNav from "@/components/store/BottomNav";
import SupportButtons from "@/components/store/SupportButtons";
import MetaPixel from "@/components/store/MetaPixel";
import { getCategories, getSettings } from "@/server/queries";
export const revalidate = 60;

const RADIUS: Record<string, string> = { none: "0px", sm: "6px", md: "10px", lg: "14px", full: "9999px" };
const BTN_PAD: Record<string, string> = { sm: "0.4rem 0.9rem", md: "0.55rem 1.15rem", lg: "0.7rem 1.4rem" };

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const radius = RADIUS[settings.buttonRadius || "full"] || RADIUS.full;
  const pad = BTN_PAD[settings.buttonSize || "md"] || BTN_PAD.md;
  const style = {
    ["--color-primary" as string]: settings.primaryColor || "#E11D48",
    ["--color-accent" as string]: settings.accentColor || "#F59E0B",
    ["--btn-radius" as string]: radius,
    ["--btn-pad" as string]: pad,
  } as React.CSSProperties;

  return (
    <div style={style}>
      <Header settings={settings} categories={categories} />
      <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-6 pb-24 md:pb-6">{children}</main>
      <Footer settings={settings} categories={categories} />
      <BottomNav />
      <SupportButtons settings={settings} />
      <MetaPixel pixelId={settings.metaPixelId} />
    </div>
  );
}
