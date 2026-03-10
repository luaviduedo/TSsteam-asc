"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

interface SteamUserResult {
  STEAM: {
    personaname: string;
    avatarfull: string;
  };
}

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
          req_steam_id_64: steamId64,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar o formulário");
      }

      const data: SteamUserResult = await response.json();
      setResult(data);
    } catch (err) {
      setError("Não foi possível buscar os dados da Steam.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.subtitle}>Steam ID 64 = EX: 76561198145040749</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={steamId64}
            onChange={(e) => setSteamId64(e.target.value)}
            placeholder="Digite o Steam ID 64"
            className={styles.input}
            required
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Enviando..." : "Buscar"}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        {result?.STEAM && (
          <article className={styles.userCard}>
            <img
              src={result.STEAM.avatarfull}
              alt={`Avatar de ${result.STEAM.personaname}`}
              className={styles.avatar}
            />

            <div className={styles.userInfo}>
              <span className={styles.label}>Usuário encontrado</span>
              <h2 className={styles.userName}>{result.STEAM.personaname}</h2>
            </div>
          </article>
        )}

        <div className={styles.links}>
          <a
            href="https://steamid.xyz"
            target="_blank"
            rel="noreferrer"
            className={styles.link}
          >
            Ver Meu ID 64
          </a>
        </div>
      </section>
    </main>
  );
}
