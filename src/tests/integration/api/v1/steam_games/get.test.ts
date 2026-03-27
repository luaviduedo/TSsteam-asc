import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/steam_games", () => {
  test("deve retornar 400 quando não enviar input", async () => {
    const response = await fetch("http://localhost:3000/api/v1/steam_games");

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.code).toBeDefined();
    expect(body.error).toBeDefined();
  });

  test("deve retornar 200 com SteamID válido", async () => {
    const response = await fetch(
      "http://localhost:3000/api/v1/steam_games?input=76561197960435530",
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.steam_id_64).toBe("76561197960435530");
    expect(Array.isArray(body.games)).toBe(true);
    expect(body.total_games_found).toBeDefined();
  });

  test("deve aceitar URL do perfil Steam", async () => {
    const response = await fetch(
      "http://localhost:3000/api/v1/steam_games?input=https://steamcommunity.com/profiles/76561197960435530",
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.steam_id_64).toBe("76561197960435530");
  });

  test("deve retornar erro para input inválido", async () => {
    const response = await fetch(
      "http://localhost:3000/api/v1/steam_games?input=INVALID_USER_@@@",
    );

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.code).toBeDefined();
    expect(body.error).toBeDefined();
  });

  test("deve funcionar com force_refresh=true", async () => {
    const response = await fetch(
      "http://localhost:3000/api/v1/steam_games?input=76561197960435530&force_refresh=true",
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.steam_id_64).toBe("76561197960435530");
  });
});
