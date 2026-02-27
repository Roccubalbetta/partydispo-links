import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.riccardo.partydispo",
          sha256_cert_fingerprints: [
            "F8:1D:02:37:0C:22:43:C5:F3:93:26:D3:DC:4D:79:E8:F9:FD:A8:77:B8:E6:0E:63:7E:1A:98:74:9C:C7:D1:F4",
          ],
        },
      },
    ],
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}