import { useState, useMemo, useId, useRef, FormEvent } from "react";
import {
	startOfWeek,
	startOfMonth,
	endOfWeek,
	endOfMonth,
	eachDayOfInterval,
	isSameMonth,
	endOfDay,
	isBefore,
	isToday,
	subMonths,
	addMonths,
	isSameDay,
	parse,
} from "date-fns";
import { formatDate } from "../utils/formatDate";
import { cc } from "../utils/cc";
import { EVENT_COLORS, useEvents } from "../hooks/useEvents";
import { Modal, ModalProps } from "./Modal";
import { UnionOmit } from "../utils/types";
import { Event } from "../context/Events";

export default function Calendar() {
	const [selectedMonth, setSelectedMonth] = useState(new Date());
	const calendarDays = useMemo(() => {
		const firstWeekStart = startOfWeek(startOfMonth(selectedMonth));
		const lastWeekEnd = endOfWeek(endOfMonth(selectedMonth));
		return eachDayOfInterval({ start: firstWeekStart, end: lastWeekEnd });
	}, [selectedMonth]);

	const { events } = useEvents();

	return (
		<div className="calendar">
			<div className="header">
				<button className="btn" onClick={() => setSelectedMonth(new Date())}>
					Today
				</button>
				<div>
					<button
						className="month-change-btn"
						onClick={() => {
							setSelectedMonth((m) => subMonths(m, 1));
						}}
					>
						&lt;
					</button>
					<button
						className="month-change-btn"
						onClick={() => {
							setSelectedMonth((m) => addMonths(m, 1));
						}}
					>
						&gt;
					</button>
				</div>
				<span className="month-title">
					{formatDate(selectedMonth, { month: "long", year: "numeric" })}
				</span>
			</div>
			<div className="days">
				{calendarDays.map((day, index) => (
					<CalendarDay
						key={day.getTime()}
						day={day}
						showWeekName={index < 7}
						selectedMonth={selectedMonth}
						events={events.filter((event) => isSameDay(day, event.date))}
					/>
				))}
			</div>
		</div>
	);
}

type CalendarDayProps = {
	day: Date;
	showWeekName: boolean;
	selectedMonth: Date;
	events: Event[];
};

function CalendarDay({
	day,
	showWeekName,
	selectedMonth,
	events,
}: CalendarDayProps) {
	const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
	const { addEvent } = useEvents();

	const sortedEvents = useMemo(() => {
		const timeToNumber = (time: string) => parseFloat(time.replace(":", "."));

		return [...events].sort((a, b) => {
			if (a.allDay && b.allDay) {
				return 0;
			} else if (a.allDay) {
				return -1;
			} else if (b.allDay) {
				return 1;
			} else {
				return timeToNumber(a.startTime) - timeToNumber(b.startTime);
			}
		});
	}, [events]);

	return (
		<div
			className={cc(
				"day",
				!isSameMonth(day, selectedMonth) && "non-month-day",
				isBefore(endOfDay(day), new Date()) && "old-month-day"
			)}
		>
			<div className="day-header">
				{showWeekName && (
					<div className="week-name">
						{formatDate(day, { weekday: "short" })}
					</div>
				)}
				<div className={cc("day-number", isToday(day) && "today")}>
					{formatDate(day, { day: "numeric" })}
				</div>
				<button
					className="add-event-btn"
					onClick={() => setIsNewEventModalOpen(true)}
				>
					+
				</button>
			</div>
			{sortedEvents.length > 0 && (
				<div className="events">
					{sortedEvents.map((event) => (
						<CalendarEvent key={event.id} event={event} />
					))}
				</div>
			)}
			<EventFormModal
				date={day}
				isOpen={isNewEventModalOpen}
				onClose={() => setIsNewEventModalOpen(false)}
				onSubmit={addEvent}
			/>
		</div>
	);
}

function CalendarEvent({ event }: { event: Event }) {
	return (
		<button
			className={cc("event", event.color, event.allDay && "all-day-event")}
		>
			{event.allDay ? (
				<div className="event-name">{event.name}</div>
			) : (
				<>
					<div className={`color-dot ${event.color}`}></div>
					<div className="event-time">
						{formatDate(parse(event.startTime, "HH:mm", event.date), {
							timeStyle: "short",
						})}
					</div>
					<div className="event-name">{event.name}</div>
				</>
			)}
		</button>
	);
}

type EventFormModalProps = {
	onSubmit: (event: UnionOmit<Event, "id">) => void;
} & (
	| { onDelete: () => void; event: Event; date?: never }
	| { onDelete?: never; event?: never; date: Date }
) &
	Omit<ModalProps, "children">;

function EventFormModal({
	onSubmit,
	onDelete,
	event,
	date,
	...modalProps
}: EventFormModalProps) {
	const isNew = event == null;
	const formId = useId();
	const [selectedColor, setSelectedColor] = useState(
		event?.color || EVENT_COLORS[0]
	);
	const [isAllDayChecked, setIsAllDayChecked] = useState(
		event?.allDay || false
	);
	const [startTime, setStartTime] = useState(event?.startTime || "");
	const endTimeRef = useRef<HTMLInputElement>(null);
	const nameRef = useRef<HTMLInputElement>(null);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();

		const name = nameRef.current?.value;
		const endTime = endTimeRef.current?.value;

		if (name === null || name === "") return;

		const commonProps = {
			name,
			date: date || event?.date,
			color: selectedColor,
		};
		let newEvent: UnionOmit<Event, "id">;

		if (isAllDayChecked) {
			newEvent = {
				...commonProps,
				allDay: true,
			};
		} else {
			if (
				startTime == null ||
				startTime === "" ||
				endTime == null ||
				endTime === ""
			) {
				return;
			}
			newEvent = {
				...commonProps,
				allDay: false,
				startTime,
				endTime,
			};
		}
		modalProps.onClose();
		onSubmit(newEvent);
	}

	return (
		<Modal {...modalProps}>
			<div className="modal-title">
				<div>{isNew ? "Add" : "Edit"} Event</div>
				<small>{formatDate(date || event.date, { dateStyle: "short" })}</small>
				<button className="close-btn" onClick={modalProps.onClose}>
					&times;
				</button>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor={`${formId}-name`}>Name</label>
					<input ref={nameRef} required type="text" id={`${formId}-name`} />
				</div>
				<div className="form-group checkbox">
					<input
						checked={isAllDayChecked}
						onChange={(e) => setIsAllDayChecked(e.target.checked)}
						type="checkbox"
						id={`${formId}-all-day`}
					/>
					<label htmlFor={`${formId}-all-day`}>All Day?</label>
				</div>
				<div className="row">
					<div className="form-group">
						<label htmlFor={`${formId}-start-time`}>Start Time</label>
						<input
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
							required={!isAllDayChecked}
							disabled={isAllDayChecked}
							type="time"
							id={`${formId}-start-time`}
						/>
					</div>
					<div className="form-group">
						<label htmlFor={`${formId}-end-time`}>End Time</label>
						<input
							ref={endTimeRef}
							min={startTime}
							required={!isAllDayChecked}
							disabled={isAllDayChecked}
							type="time"
							id={`${formId}-end-time`}
						/>
					</div>
				</div>
				<div className="form-group">
					<label>Color</label>
					<div className="row left">
						{EVENT_COLORS.map((color) => (
							<div key={color}>
								<input
									type="radio"
									name="color"
									value={color}
									id={`${formId}-${color}`}
									checked={selectedColor === color}
									onChange={() => setSelectedColor(color)}
									className="color-radio"
								/>
								<label htmlFor={`${formId}-${color}`}>
									<span className="sr-only">{color}</span>
								</label>
							</div>
						))}
					</div>
				</div>
				<div className="row">
					<button className="btn btn-success" type="submit">
						{isNew ? "Add" : "Edit"}
					</button>
					{onDelete != null && (
						<button className="btn btn-delete" type="button" onClick={onDelete}>
							Delete
						</button>
					)}
				</div>
			</form>
		</Modal>
	);
}
