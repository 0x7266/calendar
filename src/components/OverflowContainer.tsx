import { ReactNode, Key, useRef, useState, useLayoutEffect } from "react";

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
useLayoutEffect(() => {
if (containerRef.current == null) return

const observer = new ResizeObserver(entries => {
	const containerElement = entries[0]?.target
	if (containerElement == null) return
})
observer.observe(containerRef.current)

return () => observer.disconnect()
}, [items])

return (
<>
<div className={className} ref={containerRef}>
{items.map(item => (
<div data-item key={getKey(item)}>{renderItem(item)}</div>
))}
</div>
<div data-overflow>{renderOverflow(overflowAmount)}</div>
</>
)
}

