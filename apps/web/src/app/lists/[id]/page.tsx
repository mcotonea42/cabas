"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Item, List } from "@/lib/types";
import { apiFetch, API_URL, requireAuth } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TextInput } from "@/components/TextInput";

export default function ListPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [list, setList] = useState<List | null>(null);

  async function loadItems() {
    const res = await apiFetch(`/lists/${id}/items`);
    setItems(await res.json());
  }

  async function loadList() {
    const res = await apiFetch(`/lists/${id}`);
    if (!res.ok) return;
    setList(await res.json());
  }

  useEffect(() => {
    requireAuth(router);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems();
    loadList();

    const eventSource = new EventSource(`${API_URL}/events`);
    eventSource.addEventListener("items-changed", () => {
      loadItems();
    });

    return () => {
      eventSource.close();
    };
  }, [id]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return;

    await apiFetch(`/lists/${id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    loadItems();
  }

  async function toggleItem(item: Item) {
    await apiFetch(`/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isChecked: !item.isChecked }),
    });
    loadItems();
  }

  async function deleteItem(itemId: string) {
    await apiFetch(`/items/${itemId}`, { method: "DELETE" });
    loadItems();
  }

  async function clearChecked() {
    await apiFetch(`/lists/{id}/items/checked)`, { method: "DELETE" });
    loadItems();
  }

  const checkedCount = items.filter((item) => item.isChecked).length;

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Card>
          <div className=" flex items-center justify-between gap-3 mb-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-lg border border-taupe/40 px-3 py-1.5 text-sm font-medium text-taupe hover:bg-white/40"
            >
              <ArrowLeft className="h-4 w-4" />
              Mes listes
            </Link>
            <h1 className="text-ebony text-xl font-semibold truncate">{list?.name}</h1>
          </div>

          <p className="text-taupe mb-6 text-sm">
            {items.length} article{items.length > 1 ? "s" : ""}, {checkedCount}{" "}
            coché{checkedCount > 1 ? "s" : ""}
          </p>

          <form onSubmit={addItem} className="flex gap-2 mb-6">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ajouter un article"
              className="flex-1"
            />
            <Button
              type="submit"
            >
              Ajouter
            </Button>
          </form>

          <ul className="flex flex-col gap-1.5">
            {items.filter((item) => !item.isChecked).map((item) => (
                <li key={item.id} className="flex items-center justify-center rounded-lg bg-white/60 px-3 py-2">
                  <label className="flex flex-1 items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={() => toggleItem(item)}
                      className="h-4 w-4 accent-olive"
                    />
                    <span className="text-ebony">{item.name}</span>
                  </label>
                  <button onClick={() => deleteItem(item.id)} className="text-xs text-taupe hover:text-red-600"> 
                    Supprimer
                  </button>
                </li>
              ))}
            {items.length === 0 && (
              <p className="px-3 py-2 text-center text-sm text-taupe">La liste est vide</p>)}
          </ul>

          {checkedCount > 0 && (
            <>
              <p className="text-xs uppercase tracking-wide text-taupe mt-4 mb-2">Coché{checkedCount > 1 ? "s" : ""}</p>
              <ul className="flex flex-col gap-1.5">
                {items.filter((item) => item.isChecked).map((item) => (
                    <li key={item.id} className="flex items-center justify-between rounded-lg bg-white/40 px-3 py-2">
                      <label className="flex flex-1 items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={item.isChecked}
                          onChange={() => toggleItem(item)}
                          className="h-4 w-4 accent-olive"
                        />
                        <span className="text-taupe line-through">{item.name}</span>
                      </label>
                      <button onClick={() => deleteItem(item.id)} className="text-xs text-taupe hover:text-red-600">Supprimer</button>
                    </li>
                  ))}
              </ul>

              <button onClick={clearChecked} className="mt-4 text-sm text-taupe hover:text-ebony">
                Vider les {checkedCount} article{checkedCount > 1 ? "s" : ""} coché
                {checkedCount > 1 ? "s" : ""}
              </button>
            </>
          )}
        </Card>
      </div>

    </main>
  );
}
