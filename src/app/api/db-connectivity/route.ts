import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import net from "node:net";

export const dynamic = "force-dynamic";

function testTcp(host: string, port: number): Promise<{
    connected: boolean;
    error?: string;
    code?: string;
}> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(5000);

        socket.connect(port, host, () => {
            socket.destroy();
            resolve({ connected: true });
        });

        socket.on("timeout", () => {
            socket.destroy();
            resolve({
                connected: false,
                error: "Timeout after 5000ms",
                code: "ETIMEDOUT",
            });
        });

        socket.on("error", (err: Error & { code?: string }) => {
            socket.destroy();
            resolve({
                connected: false,
                error: err.message,
                code: err.code || "UNKNOWN",
            });
        });
    });
}

export async function GET(request: NextRequest) {
    const token = process.env["CONNECTIVITY_TEST_TOKEN"];

    if (!token) {
        return NextResponse.json(
            { error: "CONNECTIVITY_TEST_TOKEN is missing in Preview runtime" },
            { status: 500 }
        );
    }
    if (
        request.headers.get("authorization") !== `Bearer ${token}`
    ) {
        return NextResponse.json(
            { error: "Token mismatch" },
            { status: 401 }
        );
    }

    const databaseUrl = process.env["DATABASE_URL"];

    if (!databaseUrl) {
        return NextResponse.json(
            { error: "DATABASE_URL is missing" },
            { status: 500 }
        );
    }

    try {
        const url = new URL(databaseUrl);

        let targets: { name: string; port: number }[] = [];

        if (url.protocol === "mysql:" || url.protocol === "mariadb:") {
            targets = [{
                name: url.hostname || "127.0.0.1",
                port: Number(url.port || 3306),
            }];
        } else {
            return NextResponse.json({
                success: false,
                error: `Unsupported protocol: ${url.protocol}`,
            });
        }

        const results = [];

        for (const target of targets) {
            let dnsResult: string;

            try {
                const addresses = await lookup(target.name, {
                    all: true,
                });

                dnsResult = addresses
                    .map((item) => item.address)
                    .join(", ");
            } catch (error) {
                dnsResult =
                    error instanceof Error ? error.message : "DNS failed";
            }

            const tcp = await testTcp(target.name, target.port);

            results.push({
                host: target.name,
                port: target.port,
                dns: dnsResult,
                tcp,
            });
        }

        return NextResponse.json({
            success: results.every((item) => item.tcp.connected),
            environment: "GoDaddy Preview",
            protocol: url.protocol,
            targets: results,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unknown error",
        });
    }
}
