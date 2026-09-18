'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiFetch, requireAuth } from "@/lib/api";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Household } from "@/lib/types";
import { toast } from "sonner";

export default function SettingsPage() {
    const router = useRouter();
    const [household, setHousehold] = useState<Household | null>(null);

    async function loadHousehold() {
        const res = await apiFetch('/auth/me');
        const data = await res.json();
        setHousehold(data.household);
    };

    useEffect(() => {
        requireAuth(router);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadHousehold();
    }, []);

    async function handleLogout() {
        const res = await apiFetch('/auth/logout', { method: 'POST' });

        if (!res.ok) {
            toast.error("Impossible de se déconnecter");
            return;
        }

        router.push("/login");
    }

    return (
        <main className="flex min-h-dvh flex-col items-center px-4 py-10">
            <div className="w-full max-w-sm">
                <Card>
                    <div className="mb-6 flex items-center gap-3">
                        <Link
                            href="/"
                            aria-label="Retour"
                            className="inline-flex items-center gap-1 rounded-lg border border-taupe/40 px-3 py-1.5 text-sm font-medium text-taupe hover:bg-white/40">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-ebony text-xl font-semibold">Paramètres</h1>
                    </div>

                    {household && (
                        <p className="border-taupe/20 bg-white/60 text-taupe mb-6 rounded-lg border px-3 py-2 text-xs">
                            Code d&apos;invitation de {household.name} : {" "}
                            <strong className="text-ebony">{household.inviteCode}</strong>
                        </p>
                    )}

                    <Button onClick={handleLogout} className="w-full">
                        Se déconnecter
                    </Button>
                </Card>
            </div>
        </main>
    )
}