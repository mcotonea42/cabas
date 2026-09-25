"use client";

import { useEffect, useState } from "react";
import { List } from "@/lib/types";
import Link from "next/link";
import { apiFetch, requireAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TextInput } from "@/components/TextInput";
import { toast } from "sonner";
import { DeleteAction } from "@/components/DeleteAction";
import { Trash2 } from "lucide-react";
import { Settings } from "lucide-react";
import { CardList } from "@/components/CardList";

export default function Home() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [lists, setLists] = useState<List[]>([]);
  const [name, setName] = useState("");

  async function loadLists() {
    const res = await apiFetch(`/lists`);
    setLists(await res.json());
  }

  useEffect(() => {
    async function init() {
      const isAuthenticated = await requireAuth(router);
      if (!isAuthenticated) return;

      setIsAuthChecked(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadLists();
    }

    init();
  }, []);

  async function createList(name: string) {
    const res = await apiFetch(`/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      toast.error("Impossible de créer la liste");
      return;
    }

    toast.success("Liste créée");
    loadLists();
  }

  async function deleteList(id: string) {
    const res = await apiFetch(`/lists/${id}`, { method: "DELETE" });

    if (!res.ok) {
      toast.error("Impossible de supprimer la liste");
      return;
    }

    toast.success("Liste supprimée");
    loadLists();
  }

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    await createList(name);
    setName("");
  }

  if (!isAuthChecked) return null;

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 py-10">
      <Link
        href="/settings"
        aria-label="Paramètres"
        className="absolute right-4 top-4 rounded-lg border border-taupe/40 p-2 text-taupe hover:bg-white/40"
      >
        <Settings className="h-4 w-4" />
      </Link>

      <header className="mb-8 text-center">
        <h1 className="text-olive text-2xl font-bold">Cabas</h1>
        <p className="text-taupe mt-1 text-sm">Nos listes de courses</p>
      </header>

      <div className="w-full max-w-sm sm:max-w-2xl">
        <Card className="mb-4">
          <form onSubmit={handleCreateList} className="flex gap-2">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la liste"
              className="flex-1"
            />
              <Button type="submit">Créer une liste</Button>
          </form>
        </Card>
      </div>

      <div className="mt-4 w-full max-w-sm sm:max-w-4xl">
        {lists.length === 0 ? (
          <p className="text-taupe px-3 py-2 text-center text-sm">
            Aucune liste pour l&apos;instant
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {lists.map((list) => (
              <CardList key={list.id}>
                <DeleteAction
                  onClick={() => deleteList(list.id)}
                  aria-label="Supprimer la liste"
                  className="absolute right-2 top-2 z-10"
                >
                  <Trash2 className="h-4 w-4" />
                </DeleteAction>    
                <Link
                  href={`/lists/${list.id}`}
                  className="flex flex-col gap-1 pr-6 after:absolute after:inset-0"
                >
                  <span className="text-ebony hover:text-olive text-sm font-medium">
                    {list.name}
                  </span>
                  {list.itemsCount > 0 && (
                    <span className="text-taupe text-xs">
                      {list.checkedCount}/{list.itemsCount} cochés
                    </span>
                  )}
                </Link>
              </CardList>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
