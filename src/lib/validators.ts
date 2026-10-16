import { z } from "zod";

const url = z.string().max(1000).refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "Must be a valid URL or path");
const optionalDate = z.string().optional().transform((v) => (v ? v : undefined));

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z.string().trim().max(140).optional(),
  description: z.string().trim().max(5000).default(""),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  oldPrice: z.coerce.number().min(0).optional().transform((v) => (v ? v : undefined)),
  unit: z.string().trim().max(40).default("1 pc"),
  emoji: z.string().trim().max(8).default("🛒"),
  image: url.optional().transform((v) => v || undefined),
  images: z.array(url).max(8).default([]),
  genericName: z.string().trim().max(160).optional().transform((v) => v || undefined),
  manufacturer: z.string().trim().max(120).optional().transform((v) => v || undefined),
  prescriptionRequired: z.boolean().default(false),
  categoryId: z.string().trim().min(1, "Choose a category"),
  stock: z.coerce.number().int().min(0).default(0),
  rating: z.coerce.number().min(0).max(5).default(0),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(60),
  slug: z.string().trim().max(80).optional(),
  emoji: z.string().trim().max(8).default("🛍️"),
  image: url.optional().transform((v) => v || undefined),
  coverImage: url.optional().transform((v) => v || undefined),
  description: z.string().trim().max(300).optional().transform((v) => v || undefined),
  coverOverlay: z.enum(["dark", "medium", "light", "none"]).optional(),
  coverHeight: z.enum(["sm", "md", "lg"]).optional(),
  kind: z.enum(["grocery", "medicine"]).default("grocery"),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const bannerSchema = z.object({
  title: z.string().trim().max(120).default(""),
  subtitle: z.string().trim().max(240).default(""),
  image: url.refine((v) => v.length > 0, "Cover image is required"),
  mobileImage: url.optional().transform((v) => v || undefined),
  ctaLabel: z.string().trim().max(40).default(""),
  ctaHref: z.string().trim().max(300).default("/products"),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const offerSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  description: z.string().trim().max(400).default(""),
  image: url.optional().transform((v) => v || undefined),
  badge: z.string().trim().max(24).default(""),
  code: z.string().trim().toUpperCase().max(24).regex(/^[A-Z0-9_-]*$/, "Letters, numbers, - and _ only").optional().transform((v) => v || undefined),
  discountType: z.enum(["percent", "flat"]).default("percent"),
  discountValue: z.coerce.number().min(0).default(0),
  minOrder: z.coerce.number().min(0).default(0),
  startsAt: optionalDate,
  endsAt: optionalDate,
  active: z.boolean().default(true),
}).refine((o) => o.discountType !== "percent" || o.discountValue <= 100, { message: "Percent cannot exceed 100", path: ["discountValue"] });

export const settingsSchema = z.object({
  storeName: z.string().trim().min(1).max(60),
  tagline: z.string().trim().max(160).default(""),
  phone: z.string().trim().max(30).default(""),
  whatsapp: z.string().trim().max(30).default(""),
  email: z.string().trim().max(120).default(""),
  address: z.string().trim().max(240).default(""),
  facebook: z.string().trim().max(240).default(""),
  hours: z.string().trim().max(160).default(""),
  mapUrl: z.string().trim().max(600).default(""),
  announcement: z.string().trim().max(200).default(""),
  minOrder: z.coerce.number().min(0).default(0),
  serviceCharge: z.coerce.number().min(0).max(100000).optional(),
  deliveryInside: z.coerce.number().min(0),
  deliveryOutside: z.coerce.number().min(0),
  freeDeliveryOver: z.coerce.number().min(0).default(0),
  logo: url.default(""),
  footerText: z.string().trim().max(300).default(""),
  heroTitle: z.string().trim().max(120).default(""),
  heroSubtitle: z.string().trim().max(240).default(""),
  heroCta: z.string().trim().max(40).default(""),
  features: z.array(z.object({ icon: z.string().trim().max(8), title: z.string().trim().max(40), text: z.string().trim().max(80) })).max(8),
  payCod: z.boolean(), payBkash: z.boolean(), bkashNumber: z.string().trim().max(30).default(""),
  payNagad: z.boolean(), nagadNumber: z.string().trim().max(30).default(""), payOnline: z.boolean(),
  payInstructions: z.string().trim().max(400).default(""),
  showMedicine: z.boolean(),
  medicineTitle: z.string().trim().max(80).default(""),
  medicineSubtitle: z.string().trim().max(200).default(""),
  medicineNotice: z.string().trim().max(300).default(""),
  emptyStateTitle: z.string().trim().max(80).optional(),
  emptyStateText: z.string().trim().max(240).optional(),
  emptyStateIcon: z.string().trim().max(8).optional(),
  returnPolicy: z.string().trim().max(2000).optional(),
  exchangePolicy: z.string().trim().max(2000).optional(),
  primaryColor: z.string().trim().max(20).optional(),
  accentColor: z.string().trim().max(20).optional(),
  secondaryColor: z.string().trim().max(20).optional(),
  buttonRadius: z.enum(["none", "sm", "md", "lg", "full"]).optional(),
  buttonSize: z.enum(["sm", "md", "lg"]).optional(),
  supportCallLabel: z.string().trim().max(40).optional(),
  supportWaLabel: z.string().trim().max(40).optional(),
  showSupportCall: z.boolean().optional(),
  showSupportWa: z.boolean().optional(),
  invoiceFooter: z.string().trim().max(300).optional(),
  metaPixelId: z.string().trim().max(40).optional().or(z.literal("")),
  courierOutsideNote: z.string().trim().max(300).optional(),
  footerPromoImage: url.optional().or(z.literal("")).optional(),
  footerPromoLink: z.string().trim().max(400).optional(),
});
/** Admin pages save only the fields they edit; the server merges them into the stored settings. */
export const settingsPatchSchema = settingsSchema.partial();

export const zoneSchema = z.object({
  name: z.string().trim().min(2, "Area name is required").max(60),
  charge: z.coerce.number().min(0, "Charge must be 0 or more"),
  freeOver: z.coerce.number().min(0).default(0),
  eta: z.string().trim().max(60).default(""),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const riderSchema = z.object({
  name: z.string().trim().min(2, "Rider name is required").max(80),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "Enter a valid mobile number (01XXXXXXXXX)"),
  vehicle: z.string().trim().max(40).default(""),
  area: z.string().trim().max(80).default(""),
  note: z.string().trim().max(200).default(""),
  active: z.boolean().default(true),
  password: z.string().max(60).optional().transform((v) => v || undefined).refine((v) => !v || v.length >= 6, "Password must be at least 6 characters"),
});

export const inventorySchema = z.object({
  productId: z.string().min(1),
  mode: z.enum(["add", "remove", "set"]),
  qty: z.coerce.number().int().min(0, "Quantity must be 0 or more").max(1_000_000),
  reason: z.string().trim().max(80).default(""),
});

export const orderCreateSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "Enter a valid mobile number (01XXXXXXXXX)"),
  address: z.string().trim().min(8, "Enter your full address").max(300),
  zone: z.string().trim().min(1, "Choose a delivery area").max(60),
  payment: z.string().trim().min(1).max(40).default("cod"),
  paymentRef: z.string().trim().max(40).optional(),
  paymentFrom: z.string().trim().max(20).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  note: z.string().trim().max(300).optional().default(""),
  couponCode: z.string().trim().toUpperCase().max(24).optional(),
  items: z.array(z.object({ id: z.string().min(1), qty: z.coerce.number().int().min(1).max(100) })).min(1, "Your cart is empty").max(60),
});

export const orderPatchSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "assigned", "picked_up", "on_the_way", "delivered", "cancelled", "returned"]).optional(),
  riderId: z.string().max(60).optional(),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "failed", "refunded"]).optional(),
}).refine((v) => v.status !== undefined || v.riderId !== undefined || v.paymentStatus !== undefined, { message: "Nothing to update" });

export const loginSchema = z.object({ email: z.string().trim().email("Enter a valid email"), password: z.string().min(1, "Enter your password") });

const bdMobile = (msg = "Enter a valid mobile number (01XXXXXXXXX)") => z.string().trim().regex(/^01[3-9]\d{8}$/, msg);

/** Public rider application (fields arrive as multipart text parts, the two NID photos as files). */
export const riderApplySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: bdMobile(),
  password: z.string().min(6, "Password must be at least 6 characters").max(60),
  nidNumber: z.string().trim().regex(/^(\d{10}|\d{13}|\d{17})$/, "NID number must be 10, 13 or 17 digits"),
  permanentAddress: z.string().trim().min(8, "Enter your permanent address").max(300),
  presentAddress: z.string().trim().min(8, "Enter your present address").max(300),
  vehicle: z.string().trim().max(40).default(""),
  area: z.string().trim().max(80).default(""),
  referrerName: z.string().trim().min(2, "Enter the referrer's name").max(80),
  referrerPhone: bdMobile("Enter a valid mobile number for the referrer (01XXXXXXXXX)"),
  referrerRelation: z.string().trim().max(40).default(""),
});
/** Admin decision on an application. A reason is required when rejecting. */
export const riderReviewSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject"), reason: z.string().trim().min(3, "Write the reason for rejecting").max(200) }),
]);

export const riderLoginSchema = z.object({ phone: z.string().trim().min(5).max(20), password: z.string().min(1).max(60) });
export const riderStatusSchema = z.object({ status: z.enum(["picked_up", "on_the_way", "delivered", "returned"]) });

/** Rider app → live GPS ping. `stop` clears the shared position (rider went offline). */
export const riderLocationSchema = z.union([
  z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  z.object({ stop: z.literal(true) }),
]);

export const employeeSchema = z.object({
  name: z.string().trim().min(2, "Name required").max(80),
  phone: z.string().trim().min(5).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
  role: z.enum(["ceo", "manager", "supervisor", "staff", "rider", "warehouse", "support"]),
  department: z.string().trim().max(60).optional().or(z.literal("")),
  active: z.boolean().default(true),
  joinedAt: z.string().trim().max(30).optional().or(z.literal("")),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
  riderId: z.string().trim().max(40).optional().or(z.literal("")),
});

export const attendanceSchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  checkIn: z.string().trim().max(30).optional().or(z.literal("")),
  checkOut: z.string().trim().max(30).optional().or(z.literal("")),
  status: z.enum(["present", "absent", "late", "half", "leave"]).default("present"),
  note: z.string().trim().max(200).optional().or(z.literal("")),
});

export const courierSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(5).max(20),
  contactPerson: z.string().trim().max(80).optional().or(z.literal("")),
  areas: z.string().trim().max(200).default("Outside Dhaka"),
  chargeNote: z.string().trim().max(200).optional().or(z.literal("")),
  trackingUrl: z.string().trim().max(400).optional().or(z.literal("")),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
});

/** Custom payment methods (Rocket, Upay, bank transfer, etc.) managed from Admin → Payments. */
export const paymentMethodSchema = z.object({
  label: z.string().trim().min(2, "Label required").max(60),
  hint: z.string().trim().max(200).default(""),
  number: z.string().trim().max(40).optional().or(z.literal("")),
  icon: z.string().trim().max(8).optional().or(z.literal("")),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
  requireTrx: z.boolean().default(true),
});
