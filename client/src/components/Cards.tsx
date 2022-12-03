import * as React from 'react';

interface CardProps {
    card: string[]
}

function Card({card}: CardProps) {
// const Card: React.FC<cardProp> = (card: cardProp) => {
    return (
        <div className="card">
            {card.map((picture: string) => (
                <button className="picture">{picture}</button>
            ))}
        </div>
    )
}

export default Card