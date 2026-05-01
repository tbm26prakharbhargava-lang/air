import Link from "next/link";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function WelcomePage() {
  return (
    <div className="space-y-6 pt-20">
      <p className="text-accent">Circles · Gurgaon MVP</p>
      <h1 className="text-4xl font-bold">Find your hobby circle nearby.</h1>
      <p className="text-muted">Location-first matching for sports, corporate clubs, and creator routines.</p>
      <Link href="/onboarding"><PrimaryButton>Start Onboarding</PrimaryButton></Link>
    </div>
  );
}
