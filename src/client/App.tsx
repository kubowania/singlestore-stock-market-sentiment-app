import * as React from "react"
import user from "./data"
import Card from "./components/Card"
import getDirection from "./utils"

interface Investment {
    symbol: string
    displayName: string
    priceBought: number
    numberOfShares: number
    currency: string
    timestamp: string
}

const App = () => {
    const [pnls, setPnls] = React.useState<number[]>([])
    const formattedChange = (pnls.reduce((a, b) => a + b, 0)).toFixed(2)
    const investments = user.investments.reduce((a, b) => a + b.priceBought * b.numberOfShares, 0)
    const portfolioAmount = (Number(formattedChange) + investments).toFixed(2)
    const overallPercentageChange = ((Number(portfolioAmount) - investments) * 100 / investments).toFixed(2)

    return (
        <div className="app">
            <section className="user-info">
                <p>Welcome {user.username}</p>
                <h1>${portfolioAmount}</h1>
                <h2>
                    <span className={getDirection(formattedChange)}>
                        {getDirection(formattedChange) === "positive" && "+"}{formattedChange}USD
                    </span>
                    <span className={getDirection(overallPercentageChange)}>
                        {getDirection(overallPercentageChange) === "positive" ? "▲" : "▼"}{overallPercentageChange}%
                    </span>
                </h2>
            </section>
            <section>
                {user.investments.map((investment: Investment) => (
                    <Card key={investment.symbol} investment={investment} setPnls={setPnls}/>))}
            </section>
        </div>
    )
}

export default App
