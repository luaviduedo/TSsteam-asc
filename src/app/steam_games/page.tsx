"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type SteamGame = {
  appid: number;
  name: string;
  playtime_forever: number;
  hardest_achievement_percent: number | string | null;
  player_unlocked_achievements: number;
  total_game_achievements: number;
  completion_percentage: number | null;
  completion_difficulty_rank: number | null;
  error: string | null;
};

type SteamGamesResponse = {
  steam_id_64: string;
  total_games_found: number;
  total_games_processed: number;
  concurrency_limit?: number;
  games: SteamGame[];
  message?: string;
  error?: string;
};

function formatPlaytime(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

function getDifficultyLabel(percent: number | string | null) {
  if (percent === null || percent === undefined) {
    return "Sem dados";
  }

  const numericPercent = Number(percent);

  if (Number.isNaN(numericPercent)) {
    return "Sem dados";
  }

  if (numericPercent >= 20) {
    return "Muito fácil";
  }

  if (numericPercent >= 10) {
    return "Fácil";
  }

  if (numericPercent >= 5) {
    return "Médio";
  }

  if (numericPercent >= 1) {
    return "Difícil";
  }

  return "Muito difícil";
}

function formatAchievementPercent(value: number | string | null) {
  if (value === null || value === undefined) {
    return "Sem dados";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "Sem dados";
  }

  return `${numericValue.toFixed(2)}%`;
}

export default function Home() {
  const [steamId64, setSteamId64] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SteamGamesResponse | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSteamId64 = steamId64.trim();

    setLoading(true);
    setError("");
    setResult(null);

    if (!/^\d{17}$/.test(normalizedSteamId64)) {
      setError("Digite um SteamID64 válido com 17 dígitos.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/steam_games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          req_steam_id_64: normalizedSteamId64,
        }),
      });

      const data: SteamGamesResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar jogos.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.pageShell}>
      <section className={styles.contentCard}>
        <header className={styles.heroSection}>
          <p className={styles.heroEyebrow}>Steam ASC</p>
          <h1 className={styles.heroTitle}>Ranking de jogos para 100%</h1>
          <p className={styles.heroDescription}>
            Veja quais jogos da biblioteca parecem mais tranquilos de completar.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <input
            type="text"
            inputMode="numeric"
            value={steamId64}
            onChange={(event) =>
              setSteamId64(event.target.value.replace(/\D/g, ""))
            }
            placeholder="Digite o SteamID64"
            className={styles.textInput}
            maxLength={17}
          />

          <button
            type="submit"
            disabled={loading}
            className={styles.primaryButton}
          >
            {loading ? "Buscando..." : "Buscar jogos"}
          </button>
        </form>

        {error && <div className={styles.feedbackError}>{error}</div>}

        {result && (
          <>
            <section className={styles.summaryCard}>
              <div className={styles.summaryPrimary}>
                <span className={styles.summaryLabel}>SteamID64</span>
                <strong className={styles.summaryValue}>
                  {result.steam_id_64}
                </strong>
              </div>

              <div className={styles.summaryMetrics}>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Jogos encontrados</span>
                  <strong className={styles.metricValue}>
                    {result.total_games_found}
                  </strong>
                </div>

                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Jogos processados</span>
                  <strong className={styles.metricValue}>
                    {result.total_games_processed}
                  </strong>
                </div>

                {typeof result.concurrency_limit === "number" && (
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Concorrência</span>
                    <strong className={styles.metricValue}>
                      {result.concurrency_limit}
                    </strong>
                  </div>
                )}
              </div>

              {result.message && (
                <p className={styles.summaryMessage}>{result.message}</p>
              )}
            </section>

            <section className={styles.gameGrid}>
              {result.games.map((game) => (
                <article key={game.appid} className={styles.gameCard}>
                  <img
                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                    alt={game.name}
                    className={styles.gameImage}
                  />

                  <div className={styles.gameBody}>
                    <div className={styles.gameHeader}>
                      <div className={styles.gameTitleBlock}>
                        <p className={styles.gameRank}>
                          #{game.completion_difficulty_rank ?? "-"}
                        </p>

                        <div className={styles.gameTitleRow}>
                          <div className={styles.gameTitleTextBlock}>
                            <h2 className={styles.gameTitle}>{game.name}</h2>
                          </div>

                          <span className={styles.gameAppId}>
                            #{game.appid}
                          </span>
                        </div>
                      </div>

                      <span className={styles.gameBadge}>
                        {getDifficultyLabel(game.hardest_achievement_percent)}
                      </span>
                    </div>

                    <div className={styles.gameStatsGrid}>
                      <div className={styles.gameStatCard}>
                        <span className={styles.gameStatLabel}>
                          Conquista mais difícil
                        </span>
                        <strong className={styles.gameStatValue}>
                          {formatAchievementPercent(
                            game.hardest_achievement_percent,
                          )}
                        </strong>
                      </div>

                      <div className={styles.gameStatCard}>
                        <span className={styles.gameStatLabel}>
                          Tempo jogado
                        </span>
                        <strong className={styles.gameStatValue}>
                          {formatPlaytime(game.playtime_forever)}
                        </strong>
                      </div>

                      <div className={styles.gameStatCard}>
                        <span className={styles.gameStatLabel}>
                          Conquistas totais
                        </span>
                        <strong className={styles.gameStatValue}>
                          {game.total_game_achievements}
                        </strong>
                      </div>

                      <div className={styles.gameStatCard}>
                        <span className={styles.gameStatLabel}>
                          Conquistas do jogador
                        </span>
                        <strong className={styles.gameStatValue}>
                          {game.player_unlocked_achievements}
                        </strong>
                      </div>
                    </div>

                    {game.error && (
                      <p className={styles.gameFeedbackError}>
                        <strong>Erro:</strong> {game.error}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
