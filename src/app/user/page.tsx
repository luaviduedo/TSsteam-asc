"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

interface SteamUserResult {
  STEAM: {
    personaname: string;
    avatarfull: string;
  };
}

type ApiErrorResponse = {
  error?: string;
};

export default function Home() {
  const [steamId64, setSteamId64] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SteamUserResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(formInput: FormEvent<HTMLFormElement>) {
    formInput.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/v1/steam_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          req_steam_id_64: steamId64.trim(),
        }),
      });

      const data = (await response.json()) as
        | SteamUserResult
        | ApiErrorResponse;

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Não foi possível buscar os dados da Steam.",
        );
      }

      setResult(data as SteamUserResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível buscar os dados da Steam.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.pageShell}>
      <section className={styles.contentCard}>
        <header className={styles.heroSection}>
          <p className={styles.heroDescription}>
            Steam ID 64 = EX: 76561198145040749
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <input
            type="text"
            value={steamId64}
            onChange={(e) => setSteamId64(e.target.value)}
            placeholder="Digite o Steam ID 64"
            className={styles.textInput}
            required
          />

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Buscar"}
          </button>
        </form>

        {error && <p className={styles.feedbackError}>{error}</p>}

        {result?.STEAM && (
          <article className={styles.profileCard}>
            <img
              src={result.STEAM.avatarfull}
              alt={`Avatar de ${result.STEAM.personaname}`}
              className={styles.profileAvatar}
            />

            <div className={styles.profileBody}>
              <span className={styles.profileLabel}>Usuário encontrado</span>
              <h2 className={styles.profileName}>{result.STEAM.personaname}</h2>
            </div>
          </article>
        )}

        <div className={styles.actionsRow}>
          <a
            href="https://steamid.xyz"
            target="_blank"
            rel="noreferrer"
            className={styles.primaryLink}
          >
            Ver Meu ID 64
          </a>
        </div>
      </section>
    </main>
  );
}
