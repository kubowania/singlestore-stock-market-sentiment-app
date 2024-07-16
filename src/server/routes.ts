import * as express from "express"
import {
    readData
} from "./connection"
import * as dotenv from "dotenv"
const router = express.Router()
dotenv.config()
import OpenAI from "openai"
const database = "stock_sentiment"

router.get("/api/hello", (req, res, next) => {
    res.json("SingleStore")
})

router.get("/api/market/:symbol", async (req, res) => {
    const symbol = req.params.symbol
    // replace the apikey below with your own key from https://www.alphavantage.co/support/#api-key
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_KEY}`
    try {
        const response = await fetch(url)
        const data = await response.json()
        res.send(data)
    } catch (error) {
        console.error(error)
    }
})

router.get("/api/database/:symbol", async (req, res) => {
    const symbol = req.params.symbol
    try {
        const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: symbol,
            encoding_format: "float"
        })
        const embedding = response.data[0].embedding
        console.log("AAAA", symbol, embedding)
        const sqlRes = await readData({database, embedding})
        const prompt = `We need to decide if ${symbol} is a good stock to invest in.
        The tweet that is most similar to this from the 
        stock_sentiment is: ${sqlRes}. Please use this tweet to give 
        market sentiment on the stock and only this tweet. 
        Please limit the response to 120 characters.`

        const completion = await openai.chat.completions.create({
            messages: [
                {role: "system", content: "You are a helpful assistant."},
                {role: "user", content: prompt},
            ],
            model: "gpt-4o"
        })
        res.send(completion.choices[0].message.content)

    } catch (error) {
        console.error(error)
    }
})







export default router
