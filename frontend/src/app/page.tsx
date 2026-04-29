import { StatCards } from "@/components/dashboard/StatCards";
import { EvidenceTable } from "@/components/dashboard/EvidenceTable";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let evidences = [];
  let stats = { total: 0, approved: 0, pending: 0, rejected: 0 };

  try {
    const [evidencesRes, statsRes] = await Promise.all([
      fetch('http://localhost:3001/api/evidences', { cache: 'no-store' }),
      fetch('http://localhost:3001/api/stats', { cache: 'no-store' })
    ]);
    if (evidencesRes.ok) evidences = await evidencesRes.json();
    if (statsRes.ok) stats = await statsRes.json();
  } catch (error) {
    console.error('Error fetching data from backend', error);
  }

  const recentEvidences = evidences.slice(0, 5);

  return (
    <div className="p-6 lg:p-10 w-full">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Resumen de Evidencias</h2>
        <p className="text-neutral-400">
          Recepción y validación automatizada en tiempo real mediante OCR.
        </p>
      </header>

      <StatCards stats={stats} />
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Actividad Reciente</h3>
          <Link href="/evidences" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>
        <EvidenceTable data={recentEvidences} />
      </div>
    </div>
  );
}
