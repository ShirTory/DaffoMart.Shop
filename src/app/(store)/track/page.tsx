import type { Metadata } from "next";
import TrackForm from "@/components/store/TrackForm";
export const metadata: Metadata = { title: "Track Order" };
export default function TrackPage() { return <TrackForm />; }
