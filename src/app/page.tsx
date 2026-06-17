import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Hero, Features, SocialProof, Footer } from "@/components/landing";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/hoje");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Hero />
      <Features />
      <SocialProof />
      <Footer />
    </div>
  );
}
