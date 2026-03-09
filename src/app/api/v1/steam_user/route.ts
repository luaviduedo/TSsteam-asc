export async function POST(request: Request) {
  const steamKeyAPI: string = process.env.STEAM_API_KEY || "";
  const requestBody = await request.json();
  const steamId64Search = requestBody.req_steam_id_64;

  try {
    const steamIdRegex = /^\d{17}$/;

    if (!steamIdRegex.test(steamId64Search)) {
      return Response.json({ error: "SteamID64 inválido." }, { status: 400 });
    }

    async function fetchSteamUser(steamKey: string, steamId64: string) {
      const response = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId64}`,
      );
      const responseBody = await response.json();

      return responseBody;
    }

    const { response } = await fetchSteamUser(steamKeyAPI, steamId64Search);
    const steamNickName = response.players[0].personaname;

    return Response.json({ STEAM: steamNickName }, { status: 200 });
  } catch (error) {
    console.error("Erro interno:", error);

    return Response.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
