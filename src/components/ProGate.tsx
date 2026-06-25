import Link from "next/link";

export default function ProGate({ feature }: { feature: string }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-violet-200 p-8 text-center">
      <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-2xl" style={{ background: "#ede9fe" }}>
        ✨
      </div>
      <h3 className="font-bold text-slate-800 mb-2">{feature}</h3>
      <p className="text-sm text-slate-500 mb-5">
        Cette fonctionnalité est disponible avec le plan <strong>Pro</strong>.
      </p>
      <Link
        href="/settings#plan"
        className="inline-block text-sm font-semibold text-white px-5 py-2.5 rounded-full transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}
      >
        Passer au plan Pro
      </Link>
    </div>
  );
}
