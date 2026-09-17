"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TextInput } from "@/components/TextInput";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "household">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [householdMode, setHouseholdMode] = useState<"create" | "join" | null>(
    null,
  );
  const [householdName, setHouseholdName] = useState("");
  const [householdInviteCode, setHouseholdInviteCode] = useState("");

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;

    const res = await apiFetch("/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      setError("Impossible d'envoyer le code, réessaie.");
      return;
    }

    const data = await res.json();
    setIsNewUser(data.isNewUser);
    setStep('code');
  }

  async function verifyCode() {

    const household = isNewUser
      ? householdMode === "create"
        ? { type: "create", name: householdName }
        : { type: "join", inviteCode: householdInviteCode }
      : undefined;

    const res = await apiFetch("/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, household }),
    });

    if (!res.ok) {
      setError("Code invalide ou expiré");
      return;
    }

    router.push("/");
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    if (isNewUser) {
      setStep('household');
      return;
    }

    await verifyCode();
  }

  async function handleHouseholdContinue(e: React.FormEvent) {
    e.preventDefault();
    if (householdMode === "create" && !householdName.trim()) return;
    if (householdMode === "join" && !householdInviteCode.trim()) return;
    await verifyCode();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-10">
      <header className="mb-12">
        <h1 className="text-olive text-2xl font-bold">Cabas</h1>
      </header>

      <div className="flex w-full flex-1 items-center justify-center">
        <Card className="w-full max-w-sm">
          {step === "email" && (
            <div>
              <h2 className="text-ebony mb-8 text-center text-xl font-semibold">
                Connecte-toi
              </h2>

              <form onSubmit={requestCode} className="flex flex-col gap-3">
                <TextInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
                  className="w-full text-center tracking-widest"
                  required
                />
                <Button
                  type="submit"
                  className="w-full"
                >
                  Recevoir un code
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="bg-taupe/20 h-px flex-1" />
                <span className="text-taupe text-xs">ou</span>
                <div className="bg-taupe/20 h-px flex-1" />
              </div>

              <button
                disabled
                className="border-taupe/40 text-taupe w-full rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuer avec Google
              </button>
            </div>
          )}

          {step === "code" && (
            <div>
              <h2 className="text-ebony mb-2 text-center text-xl font-semibold">
                Entre ton code
              </h2>
              <p className="text-taupe mb-8 text-center text-sm">
                Code envoyé à {email}
              </p>

              <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3">
                <TextInput
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Code à 6 chiffres"
                  className="w-full text-center tracking-widest"
                />
                <div className="flex gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  >
                    {isNewUser ? 'Continuer' : 'Se connecter'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setCode("");
                    }}
                    aria-label="Retour"
                    className="border-taupe/40 text-taupe self-start rounded-lg border px-2 py-2 text-sm font-medium hover:bg-white/40"
                  >
                    <ArrowLeft className="h-5 w-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === "household" && (
            <div>
              <h2 className="text-ebony mb-2 text-center text-xl font-semibold">
                Nouveau compte
              </h2>
              <p className="text-taupe mb-8 text-center text-sm">
                {" "}
                Rejoins un foyer existant ou crées-en un
              </p>

              {!householdMode && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setHouseholdMode("create")}
                    className="border-taupe/40 text-ebony hover:border-olive hover:text-olive flex-1 rounded-lg border px-4 py-3 text-sm font-medium"
                  >
                    Créer un foyer
                  </button>
                  <button
                    onClick={() => setHouseholdMode("join")}
                    className="border-taupe/40 text-ebony hover:border-olive hover:text-olive flex-1 rounded-lg border px-4 py-3 text-sm font-medium"
                  >
                    Rejoindre un foyer
                  </button>
                </div>
              )}

              {householdMode === "create" && (
                <form
                  onSubmit={handleHouseholdContinue}
                  className="flex flex-col gap-3"
                >
                  <TextInput
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="Nom du foyer"
                    className="w-full"
                  />

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="w-full"
                    >
                      Continuer
                    </Button>
                    <button
                      type="button"
                      onClick={() => setHouseholdMode(null)}
                      aria-label="Retour"
                      className="border-taupe/40 text-taupe self-start rounded-lg border px-2 py-2 text-sm font-medium hover:bg-white/40"
                    >
                      <ArrowLeft className="h-5 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {householdMode === "join" && (
                <form
                  onSubmit={handleHouseholdContinue}
                  className="flex flex-col gap-3"
                >
                  <TextInput
                    value={householdInviteCode}
                    onChange={(e) => setHouseholdInviteCode(e.target.value)}
                    placeholder="Code d'invitation"
                    className="w-full"
                  />

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                    >
                      Continuer
                    </Button>
                    <button
                      type="button"
                      onClick={() => setHouseholdMode(null)}
                      aria-label="Retour"
                      className="border-taupe/40 text-taupe self-start rounded-lg border px-2 py-2 text-sm font-medium hover:bg-white/40"
                    >
                      <ArrowLeft className="h-5 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
