const getDirection = (amount) => {
    // note: This will return negative if no change
    return amount > 0 ? "positive" : "negative"
}

export default getDirection
