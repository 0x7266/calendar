import { ReactNode, createContext, useState } from "react";
import { UnionOmit } from "../utils/types";
import { EVENT_COLORS } from "../hooks/useEvents";

export type Event = {
	id: string;
	name: string;
	color: (typeof EVENT_COLORS)[number];
	date: Date;
} & (
	| { allDay: false; startTime: string; endTime: string }
	| { allDay: true; startTime?: never; endTime?: never }
);

type EventsContext = {
	events: Event[];
	addEvent: (event: UnionOmit<Event, "id">) => void;
	updateEvent: (id: string, event: UnionOmit<Event, "id">) => void;
	deleteEvent: (id: string) => void;
};

export const Context = createContext<EventsContext | null>(null);

type EventsProviderProps = {
	children: ReactNode;
};

export function EventsProvider({ children }: EventsProviderProps) {
	const [events, setEvents] = useLocalStorage("EVENTS", []);

	function addEvent(eventDetails: UnionOmit<Event, "id">) {
		setEvents((e) => [...e, { ...eventDetails, id: crypto.randomUUID() }]);
	}

	function updateEvent(id: string, eventDetails: UnionOmit<Event, "id">) {
		setEvents((e) => {
			return e.map((event) => {
				return event.id === id ? { id, ...eventDetails } : event;
			});
		});
	}

	function deleteEvent(id: string) {
		setEvents((e) => {
			return e.filter((event) => {
				return event.id !== id;
			});
		});
	}

	return (
		<Context.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
			{children}
		</Context.Provider>
	);
}

function useLocalStorage(key: string, initialValue: Event[]) {
	const [value, setValue] = useState<Event[]>(() => {
		const jsonValue = localStorage.getItem(key);

		if (jsonValue === null) return initialValue;

		return (JSON.parse(jsonValue) as Event[]).map((event) => {
			if (event.date instanceof Date) return event;
			return { ...event, date: new Date(event.date) };
		});
	});
}
