export type CategoryKind = "grocery" | "medicine";
export interface Category {
  id: string; name: string; slug: string; emoji: string; image?: string;
  coverImage?: string; description?: string;
  coverOverlay?: string; coverHeight?: string;
  kind?: CategoryKind; active: boolean; sortOrder: number;
}

export interface Product {
  id: string; slug: string; name: string; description: string;
  price: number; oldPrice?: number; unit: string; emoji: string;
  image?: string; images: string[];
  genericName?: string; manufacturer?: string; prescriptionRequired?: boolean;
  categoryId: string; stock: number; rating: number; sold: number;
  featured: boolean; active: boolean; createdAt: string; updatedAt: string;
}

export interface Banner {
  id: string; title: string; subtitle: string; image: string; mobileImage?: string;
  ctaLabel: string; ctaHref: string; active: boolean; sortOrder: number; createdAt: string;
}

export type DiscountType = "percent" | "flat";
export interface Offer {
  id: string; title: string; description: string; image?: string; badge: string;
  code?: string; discountType: DiscountType; discountValue: number; minOrder: number;
  startsAt?: string; endsAt?: string; active: boolean; createdAt: string;
}

export interface Feature { icon: string; title: string; text: string }
export interface StoreSettings {
  storeName: string; tagline: string; phone: string; email: string; address: string;
  announcement: string; facebook: string; whatsapp: string;
  /** legacy defaults, used only to create the first delivery zones */
  deliveryInside: number; deliveryOutside: number; freeDeliveryOver: number;
  /** Flat service / packaging charge applied at checkout (0 = off) */
  serviceCharge: number;
  hours: string; mapUrl: string; minOrder: number; logo: string; footerText: string;
  heroTitle: string; heroSubtitle: string; heroCta: string; features: Feature[];
  payCod: boolean; payBkash: boolean; bkashNumber: string; payNagad: boolean; nagadNumber: string; payOnline: boolean; payInstructions: string;
  showMedicine: boolean; medicineTitle: string; medicineSubtitle: string; medicineNotice: string;
  emptyStateTitle?: string; emptyStateText?: string; emptyStateIcon?: string;
  returnPolicy?: string; exchangePolicy?: string;
  primaryColor?: string; accentColor?: string; secondaryColor?: string;
  buttonRadius?: string; buttonSize?: string;
  supportCallLabel?: string; supportWaLabel?: string; showSupportCall?: boolean; showSupportWa?: boolean;
  invoiceFooter?: string; courierOutsideNote?: string;
  /** Meta (Facebook) Pixel ID — only loaded when non-empty */
  metaPixelId?: string;
  footerPromoImage?: string; footerPromoLink?: string;
}

export interface DeliveryZone { id: string; name: string; charge: number; freeOver: number; eta: string; active: boolean; sortOrder: number }
export type RiderStatus = "pending" | "approved" | "rejected";
/** Riders created before the application flow have no `status` and count as approved. */
export interface RiderApplication {
  nidNumber?: string; permanentAddress?: string; presentAddress?: string;
  referrerName?: string; referrerPhone?: string; referrerRelation?: string;
  hasNid?: boolean; appliedAt?: string; reviewedAt?: string; rejectReason?: string;
}
export interface Rider extends RiderApplication { id: string; name: string; phone: string; vehicle: string; area: string; note: string; active: boolean; createdAt: string; status?: RiderStatus; passHash?: string; hasPassword?: boolean;
  /** last GPS position shared by the rider app (cleared when the rider stops sharing) */
  lat?: number; lng?: number; locAt?: string }
/** A GPS point plus how old it is, as shown on maps. */
export interface GeoPoint { lat: number; lng: number }
export interface StockLog { id: string; productId: string; productName: string; before: number; after: number; change: number; reason: string; createdAt: string }

export type OrderStatus = "pending" | "confirmed" | "processing" | "assigned" | "picked_up" | "on_the_way" | "delivered" | "cancelled" | "returned";
export const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "assigned", "picked_up", "on_the_way", "delivered", "cancelled", "returned"];

/** Built-in methods plus any custom id from Admin → Payments (e.g. "rocket", "upay", "bank"). */
export type PaymentMethod = string;
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";
export const PAYMENT_LABEL: Record<string, string> = { cod: "Cash on delivery", bkash: "bKash", nagad: "Nagad", online: "Online payment" };
export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  hint: string;
  number?: string;
  /** shown but cannot be chosen yet (e.g. gateway not connected) */
  disabled?: boolean;
  /** optional icon / emoji for display */
  icon?: string;
}
/** Admin-managed extra payment methods (Rocket, Upay, bank transfer, etc.). */
export interface CustomPaymentMethod {
  id: string;
  label: string;
  hint: string;
  number?: string;
  icon?: string;
  active: boolean;
  sortOrder: number;
  requireTrx: boolean;
  createdAt: string;
}

export interface OrderItem { id: string; name: string; unit: string; price: number; qty: number; image?: string; emoji?: string }
export interface Order {
  id: string; orderNo: string; invoiceNo?: string; name: string; phone: string; address: string; zone: string; zoneName?: string;
  riderId?: string; riderName?: string; riderPhone?: string; hasRx?: boolean;
  payment: PaymentMethod; paymentStatus?: PaymentStatus; paymentRef?: string; paymentFrom?: string; lat?: number; lng?: number; note: string;
  items: OrderItem[]; subtotal: number; delivery: number; serviceCharge?: number; discount: number; couponCode?: string; total: number;
  status: OrderStatus; stockRestored?: boolean; createdAt: string; updatedAt: string;
}

export interface CartItem { id: string; slug: string; name: string; price: number; unit: string; emoji: string; image?: string; qty: number; stock?: number; rx?: boolean }

/** Staff roles from leadership to field */
export type EmployeeRole = "ceo" | "manager" | "supervisor" | "staff" | "rider" | "warehouse" | "support";
export const EMPLOYEE_ROLES: EmployeeRole[] = ["ceo", "manager", "supervisor", "staff", "warehouse", "support", "rider"];
export const ROLE_LABEL: Record<EmployeeRole, string> = {
  ceo: "CEO", manager: "Manager", supervisor: "Supervisor", staff: "Staff",
  warehouse: "Warehouse", support: "Support", rider: "Rider",
};

export interface Employee {
  id: string; name: string; phone: string; email?: string;
  role: EmployeeRole; department?: string; active: boolean;
  joinedAt?: string; notes?: string; riderId?: string;
  createdAt: string; updatedAt: string;
}

export interface AttendanceRecord {
  id: string; employeeId: string; employeeName: string; role: EmployeeRole;
  date: string; /** YYYY-MM-DD */
  checkIn?: string; checkOut?: string;
  status: "present" | "absent" | "late" | "half" | "leave";
  note?: string; createdAt: string; updatedAt: string;
}

export interface CourierPartner {
  id: string; name: string; phone: string; contactPerson?: string;
  areas: string; /** free text e.g. Outside Dhaka / Chattogram */
  chargeNote?: string; trackingUrl?: string; active: boolean;
  sortOrder: number; notes?: string; createdAt: string;
}
