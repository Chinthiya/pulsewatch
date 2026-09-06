def calculate_change_score(
    change_percent: float,
    volume: float,
    average_volume: float = 1_000_000
):
    score = 0
    reasons = []

    abs_change = abs(change_percent)

    # -----------------------------------
    # Price movement
    # -----------------------------------

    if abs_change >= 5:
        score += 50
        reasons.append("Large price movement")

    elif abs_change >= 2:
        score += 40
        reasons.append("Significant price movement")

    elif abs_change >= 1:
        score += 15
        reasons.append("Noticeable price movement")

    # -----------------------------------
    # Abnormal volume
    # -----------------------------------

    volume_ratio = volume / average_volume

    # Volume matters only when there is
    # meaningful price movement.
    if abs_change >= 1:

        if volume_ratio >= 3:
            score += 30
            reasons.append("Unusually high volume")

        elif volume_ratio >= 2:
            score += 20
            reasons.append("Above-normal volume")

    # -----------------------------------
    # Direction
    # -----------------------------------

    if change_percent > 0:
        direction = "UP"

    elif change_percent < 0:
        direction = "DOWN"

    else:
        direction = "FLAT"

    # -----------------------------------
    # Attention level
    # -----------------------------------

    if score >= 70:
        attention = "HIGH"

    elif score >= 40:
        attention = "MEDIUM"

    else:
        attention = "LOW"

    return {
        "score": min(score, 100),
        "attention": attention,
        "direction": direction,
        "reasons": reasons
    }