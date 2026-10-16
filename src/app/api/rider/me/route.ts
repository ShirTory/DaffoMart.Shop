import { handle, ok } from "@/server/http";
import { publicRider, requireRider } from "@/server/riderAuth";
export const dynamic = "force-dynamic";
export const GET = handle(async () => ok(publicRider(await requireRider())));
