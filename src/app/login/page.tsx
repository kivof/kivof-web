import { SignIn } from "@/features/auth/SignIn";
import { config } from "@/lib/config";
export const dynamic = "force-dynamic";
export default function Page() {
  return <SignIn demoEnabled={config().demoLoginEnabled} />;
}
