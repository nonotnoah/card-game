import { useRef } from "react";


export const Counter = () => {
    const renderCounter  = useRef(0);
    renderCounter.current = renderCounter.current + 1;
    return <h3>Renders: {renderCounter.current}</h3>;
};