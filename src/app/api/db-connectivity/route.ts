import { NextRequest, NextResponse } from "next/server";
import { resolveSrv, lookup } from "node:dns/promises";
import { createConnection } from "node:net";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT = 5000;

function testTcp(host: string, port: number): Promise<any> {
    return new Promise((resolve) => {
        const socket = createConnection({ host, port });

        const finish = (result: any) => {
            socket.destroy();
            resolve(result);
        };

        socket.setTimeout(TIMEOUT);

        socket.once("connect", () => {
            finish({ connected: true });
        });

        socket.once("timeout", () => {
            finish({
                connected: false,
                error: "Connection timed out",
                code: "TIMEOUT",
            });
        });

        socket.once("error", (err: NodeJS.ErrnoException) => {
            finish({
                connected: false,
                error: err.message,
                code: err.code || "UNKNOWN",
            });
        });
    });
}

export async function GET(request: NextRequest) {
    const token = process.env.CONNECTIVITY_TEST_TOKEN;

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


    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        return NextResponse.json(
            { error: "DATABASE_URL is missing" },
            { status: 500 }
        );
    }

    try {
        const url = new URL(databaseUrl);

        let targets: { name: string; port: number }[] = [];

        if (url.protocol === "mongodb+srv:") {
            const records = await resolveSrv(
                `_mongodb._tcp.${url.hostname}`
            );

            targets = records.map((record) => ({
                name: record.name.replace(/\.$/, ""),
                port: record.port,
            }));
        } else if (url.protocol === "mongodb:") {
            targets = [{
                name: url.hostname,
                port: Number(url.port || 27017),
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