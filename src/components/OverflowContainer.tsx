import { ReactNode, Key, useRef, useState } from "react";

type OverflowContainerProps<T> = {
items: T[];
renderItem: (item: T) => ReactNode;
renderOverflow: (overflowAmount: number) => ReactNode;
getKey: (item: T) => Key;
className?: string;
}

export function OverflowContainer<T>({ items, getKey, renderItem, renderOverflow, className }: OverflowContainerProps<T>) {
const [overflowAmount, setOverflowAmount] = useState(0)
const containerRef = useRef(null)
return (
<>
<div className={className} ref={containerRef}>
{items.map(item => (
<div key={getKey(item)}>{renderItem(item)}</div>
))}
</div>
<div>{renderOverflow(overflowAmount)}</div>
</>
)
}

