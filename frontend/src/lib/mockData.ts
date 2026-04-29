import { subDays } from "date-fns";

export type EvidenceStatus = "APPROVED" | "PENDING" | "REJECTED";

export interface Evidence {
  id: string;
  fullName: string;
  activityType: string;
  imageUrl: string;
  status: EvidenceStatus;
  confidence: number;
  createdAt: string;
}

const today = new Date();

export const mockEvidence: Evidence[] = [
  {
    id: "evt-1",
    fullName: "Juan Pérez García",
    activityType: "Escolar",
    imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    status: "APPROVED",
    confidence: 0.98,
    createdAt: subDays(today, 0).toISOString(),
  },
  {
    id: "evt-2",
    fullName: "María Rodríguez",
    activityType: "Academia",
    imageUrl: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    status: "PENDING",
    confidence: 0.72,
    createdAt: subDays(today, 1).toISOString(),
  },
  {
    id: "evt-3",
    fullName: "Carlos Mendoza",
    activityType: "Vocacional",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    status: "REJECTED",
    confidence: 0.34,
    createdAt: subDays(today, 1).toISOString(),
  },
  {
    id: "evt-4",
    fullName: "Ana Lilia Silva",
    activityType: "Escolar",
    imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    status: "APPROVED",
    confidence: 0.95,
    createdAt: subDays(today, 2).toISOString(),
  },
  {
    id: "evt-5",
    fullName: "Roberto Sánchez",
    activityType: "Extracurricular",
    imageUrl: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    status: "PENDING",
    confidence: 0.65,
    createdAt: subDays(today, 2).toISOString(),
  },
  {
    id: "evt-6",
    fullName: "Diana Flores",
    activityType: "Academia",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    status: "APPROVED",
    confidence: 0.88,
    createdAt: subDays(today, 3).toISOString(),
  },
  {
    id: "evt-7",
    fullName: "Fernando Gómez",
    activityType: "Vocacional",
    imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    status: "REJECTED",
    confidence: 0.42,
    createdAt: subDays(today, 3).toISOString(),
  },
  {
    id: "evt-8",
    fullName: "Lucía Ortiz",
    activityType: "Escolar",
    imageUrl: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    status: "APPROVED",
    confidence: 0.91,
    createdAt: subDays(today, 4).toISOString(),
  }
];
