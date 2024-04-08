import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// TODO: Last Date
// TODO: Color (green/red)
// TODO: Name

function DaysSinceItem({ name, isFinished, id, deleteClick }) {
    const itemColor = isFinished ? 'bg-rose-700' : 'bg-emerald-700';
    const divClass = itemColor + " flex justify-between text-white w-4/5 h-1/6 mt-2 mb-2 text-xl";

    const [startDate, setStartDate] = useState(new Date());

    return (
        <div
            className={divClass}
            id={id}
        >
            <div className="flex items-center justify-center" contentEditable={true}>{name}</div>
            <div className="flex items-end justify-end"><DatePicker showIcon selected={startDate} onChange={(date) => setStartDate(date)} /></div>
            <div onClick={() => deleteClick(id)} className="flex justify-end">X</div>
        </div>
    );
}

export default DaysSinceItem;
