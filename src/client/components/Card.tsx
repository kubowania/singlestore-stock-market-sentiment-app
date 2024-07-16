import * as React from "react"
import getDirection from "../utils"

interface Investment {
    symbol: string
    displayName: string
    priceBought: number
    numberOfShares: number
    currency: string
    timestamp: string
}

interface CardProps {
    investment: Investment
    setPnls: (oldPnls: number[]) => number[]
}

const Card: React.FC<CardProps> = ({investment, setPnls}) => {
    const [stock, setStock] = React.useState(null)
    const [sentiment, setSentiment] = React.useState<string>(null)
    const {
        symbol,
        displayName,
        priceBought,
        numberOfShares,
        currency,
    } = investment

    const getCurrentStockPrice = async () => {
        const url = `/api/market/${symbol}`
        try {
            const response = await fetch(url)
            const data = await response.json()
            setStock(data["Global Quote"])
        } catch (error) {
            console.error(error)
        }
    }

    const getStockSentiment = async () => {
        const url = `http://localhost:3000/api/database/${symbol}`
        try {
            const response = await fetch(url)
            const data = await response.text()
            setSentiment(data)
        } catch (error) {
            console.error(error)
        }
    }

    const stockPnl = stock && ((stock["05. price"] * numberOfShares) -
        (priceBought * numberOfShares)).toFixed(2)
    const pnlPercentageChange = stock && (((stock["05. price"] - priceBought) /
        priceBought) * 100).toFixed(2)

    React.useEffect(() => {
        getCurrentStockPrice()
        getStockSentiment()
        if (stockPnl) {
            setPnls(oldPnls => [...oldPnls, Number(stockPnl)])
        }
    }, [stockPnl])

    return (
        <div className="card">
            {stock && <div className="card-info">
                <div className="symbol-info">
                    <div className="icon-container">
                        <div className="icon">
                            <h4>{symbol}</h4>
                        </div>
                    </div>
                    <div className="info-container">
                        <h3>{displayName}</h3>
                        {/*how much stock you bought at the then current stock price*/}
                        <p>{numberOfShares} {symbol} • {priceBought}{currency}</p>
                    </div>
                </div>
                <div>
                    <h4>OPEN</h4>
                    <p>{stock["02. open"]}</p>
                </div>
                <div>
                    <h4>HIGH</h4>
                    <p>{stock["03. high"]}</p>
                </div>
                <div>
                    <h4>LOW</h4>
                    <p>{stock["04. low"]}</p>
                </div>
                <div>
                    <h4>PRICE</h4>
                    <p>{stock["05. price"]}</p>
                </div>
                <div>
                    <h4>CHANGE</h4>
                    <p>{stock["09. change"]}</p>
                </div>
                <div>
                    <h4>CHANGE %</h4>
                    <p>{stock["10. change percent"]}</p>
                </div>
                <div>
                    {/*amount you made/lost*/}
                    <h3 className={getDirection(stockPnl)}>{stockPnl}{currency}</h3>
                    {/*change since you bought the stock*/}
                    <p className={getDirection(pnlPercentageChange)}>{pnlPercentageChange}%</p>
                </div>
            </div>}
            <div className="info-ticker">
                <p>{sentiment}</p>
            </div>
        </div>
    )
}

export default Card