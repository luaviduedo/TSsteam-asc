import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/steam_user", () => {
  describe("Anonymous user", () => {
    test("With correct `steamId64`", async () => {
      const correctSteamId64 = "76561198145040749";
      const response = await fetch("http://localhost:3000/api/v1/steam_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          req_steam_id_64: correctSteamId64,
        }),
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({ STEAM: "rodolfo old #fimdoracismo" });
    });
    test("With incorrect `steamId64`", async () => {
      const inCorrectSteamId64 = "7656119814504074";
      const response = await fetch("http://localhost:3000/api/v1/steam_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          req_steam_id_64: inCorrectSteamId64,
        }),
      });
      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({ error: "SteamID64 inválido." });
    });
  });
});
