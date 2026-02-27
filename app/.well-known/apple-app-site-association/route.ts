import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // IMPORTANTISSIMO: Apple vuole JSON, spesso senza estensione, su questa path precisa
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: "SKJDY5H65H.com.riccardo.partydispo",
            paths: ["/i/*"],
          },
        ],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}