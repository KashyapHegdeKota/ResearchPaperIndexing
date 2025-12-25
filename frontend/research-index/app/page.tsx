import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

export default function Page() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeClient />
    </Suspense>
  );
}

function HomeSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-14 w-full rounded-2xl border bg-card/40" />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl border bg-card/40" />
        ))}
      </div>
    </main>
  );
}
