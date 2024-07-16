import * as mysql from "mysql2/promise"
import * as dotenv from "dotenv"

export async function connectSingleStore(
    config: Partial<mysql.ConnectionOptions> = {}
) {
    dotenv.config()

    const baseConfig: mysql.ConnectionOptions = {
        host: process.env.HOST,
        port: Number(process.env.DB_PORT),
        password: process.env.PASSWORD,
        user: "admin",
        database: "stock_sentiment"
    }
    return await mysql.createConnection({
        ...baseConfig,
        ...config,
    })
}

export async function stopSingleStore(conn: mysql.Connection) {
    await conn.end()
}

export async function readData({
                                   conn,
                                   database,
                                   embedding
                               }: {
    conn?: mysql.Connection,
    database: string,
    embedding: any
}) {
    try {
        let closeConn = false
        if (!conn) {
            conn = await connectSingleStore({database})
            closeConn = true
        }

        const [rows] = await conn.execute(
            `SELECT text, DOT_PRODUCT(embedding, JSON_ARRAY_PACK('[${embedding}]')) AS similarity FROM tweets ORDER BY similarity DESC LIMIT 1`
        )

        if (closeConn) {
            await stopSingleStore(conn)
        }
        return rows[0].text
    } catch (error) {
        console.error(error)
        return error
    }
}