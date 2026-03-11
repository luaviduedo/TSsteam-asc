export async function POST(request: Request) {
  try {
    const steamKeyAPI: string = process.env.STEAM_API_KEY_1 || "";

    if (!steamKeyAPI) {
      return Response.json(
        { error: "Steam API key não configurada no servidor." },
        { status: 500 },
      );
    }

    let requestBody;

    try {
      requestBody = await request.json();
    } catch {
      return Response.json(
        { error: "Body da requisição precisa ser JSON válido." },
        { status: 400 },
      );
    }

    const steamId64Search = requestBody?.req_steam_id_64;

    if (!steamId64Search) {
      return Response.json(
        { error: "Campo 'req_steam_id_64' é obrigatório." },
        { status: 400 },
      );
    }

    // SteamID64 normalmente tem 17 dígitos
    const steamIdRegex = /^\d{17}$/;

    if (!steamIdRegex.test(steamId64Search)) {
      return Response.json({ error: "SteamID64 inválido." }, { status: 400 });
    }

    async function fetchSteamUser(steamKey: string, steamId64: string) {
      const response = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId64}`,
      );

      if (!response.ok) {
        throw new Error("Erro ao consultar API da Steam.");
      }

      return response.json();
    }

    const { response } = await fetchSteamUser(steamKeyAPI, steamId64Search);

    if (!response?.players || response.players.length === 0) {
      return Response.json(
        { error: "Usuário Steam não encontrado." },
        { status: 404 },
      );
    }

    const steamUser = response.players[0];

    return Response.json({ STEAM: steamUser }, { status: 200 });
  } catch (error) {
    console.error("Erro interno:", error);

    return Response.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
