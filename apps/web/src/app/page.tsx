"use client";

import { useEffect, useState } from "react";
import { List, Household } from "@/lib/types";
import Link from "next/link";
import { apiFetch, requireAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TextInput } from "@/components/TextInput";

export default function Home() {
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [name, setName] = useState("");
  const [household, setHousehold] = useState<Household | null>(null);

  async function loadLists() {
    const res = await apiFetch(`/lists`);
    setLists(await res.json());
  }

  async function loadHousehold() {
    const res = await apiFetch("/auth/me");
    const data = await res.json();
    setHousehold(data.household);
  }

  useEffect(() => {
    requireAuth(router);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLists();
    loadHousehold();
  }, []);

  async function createList(name: string) {
    await apiFetch(`/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    loadLists();
  }

  async function deleteList(id: string) {
    await apiFetch(`/lists/${id}`, { method: "DELETE" });
    loadLists();
  }

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    await createList(name);
    setName("");
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-olive text-2xl font-bold">Cabas</h1>
        <p className="text-taupe mt-1 text-sm">Nos listes de courses</p>

        {household && (
          <p className="border-taupe/20 bg-cream text-taupe mt-4 inline-block rounded-lg border px-3 py-1.5 text-xs">
            Code d&apos;invitation de {household.name} :{" "}
            <strong className="text-ebony">{household.inviteCode}</strong>
          </p>
        )}
      </header>

      <Card className="w-full max-w-sm">
        <form onSubmit={handleCreateList} className="mb-6 flex gap-2">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la liste"
            className="flex-1"
          />
          <Button
            type="submit"
          >
            Créer une liste
          </Button>
        </form>

        <ul className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto pr-1">
          {lists.map((list) => (
            <li
              key={list.id}
              className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2"
            >
              <Link
                href={`/lists/${list.id}`}
                className="text-ebony hover:text-olive text-sm"
              >
                {list.name}
              </Link>
              <button
                onClick={() => deleteList(list.id)}
                className="text-taupe text-xs hover:text-red-600"
              >
                Supprimer la liste
              </button>
            </li>
          ))}

          {lists.length === 0 && (
            <p className="text-taupe px-3 py-2 text-center text-sm">
              Aucune liste pour l&apos;instant
            </p>
          )}
        </ul>
      </Card>
    </main>
  );
}
