"use client";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";

interface SteamUserResult {
  [key: string]: unknown;
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

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Não foi possível buscar os dados da Steam.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div></div>
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.statusSection}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionTitleText}>Início</span>
            </div>
            <div className={styles.steamForm}>
              <form onSubmit={handleSubmit}>
                <label className={styles.label} htmlFor="steamId64">
                  Steam ID 64 = EX: 76561198145040749
                </label>
                <input
                  className={styles.input}
                  id="steamId64"
                  type="text"
                  value={steamId64}
                  onChange={(e) => setSteamId64(e.target.value)}
                  placeholder="Digite o Steam ID 64"
                  required
                />

                <button
                  className={styles.buttonPrimary}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Buscar"}
                </button>
              </form>

              {error && <p>{error}</p>}

              {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <a
                className={styles.buttonPrimary}
                href="https://steamid.xyz"
                target="_blank"
              >
                Ver Meu ID 64
              </a>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <a className={styles.buttonPrimary} href="/status">
                Ver Status
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
