describe("POST /api/v1/steam_games", () => {
  test("deve retornar erro para body inválido", async () => {
    const response = await fetch("http://localhost:3000/api/v1/steam_games", {
      method: "POST",
      body: JSON.stringify(null),
    });

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.code).toBeDefined();
  });

  test("deve funcionar com SteamID válido", async () => {
    const response = await fetch("http://localhost:3000/api/v1/steam_games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        req_steam_id_64: "76561197960435530",
      }),
    });

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.steam_id_64).toBe("76561197960435530");
    expect(Array.isArray(body.games)).toBe(true);
  });

  test("deve aceitar vanity name", async () => {
    const response = await fetch("http://localhost:3000/api/v1/steam_games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        req_steam_id_64: "gaben",
      }),
    });

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.steam_id_64).toBeDefined();
  });
});
