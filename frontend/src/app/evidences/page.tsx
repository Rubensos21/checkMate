import { EvidenceTable } from "@/components/dashboard/EvidenceTable";

export const metadata = {
  title: "Evidencias | CheckMate",
};

export const dynamic = 'force-dynamic';

export default async function EvidencesPage() {
  let evidences = [];
  try {
    const res = await fetch('http://localhost:3001/api/evidences', { cache: 'no-store' });
    if (res.ok) evidences = await res.json();
  } catch (error) {
    console.error('Error fetching data from backend', error);
  }

  return (
    <div className="p-6 lg:p-10 w-full">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Todas las Evidencias</h2>
        <p className="text-neutral-400">
          Explora y filtra el historial completo de capturas procesadas.
        </p>
      </header>

      <div className="mb-4">
        <EvidenceTable data={evidences} />
      </div>
    </div>
  );
}
