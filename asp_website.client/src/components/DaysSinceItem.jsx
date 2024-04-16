import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function DaysSinceItem({ name, isFinished, id, deleteClick }) {
    const itemColor = isFinished ? 'bg-rose-700' : 'bg-emerald-700';

    const [startDate, setStartDate] = useState(new Date());
    const [text, setText] = useState(name);
    const [dateText, setDateText] = useState("NOW");
    const [itemStyle, setItemStyle] = useState(itemColor + " flex justify-between text-white w-4/5 h-1/6 mt-2 mb-2 text-xl");

    const getTimeDifference = (date) =>
    {
        const now = new Date();
        if (now.getTime() > date.getTime()) {
            return "" + Math.floor((now.getTime() - date.getTime()) / 1000 / 60 / 60 / 24) + " DAYS AGO";
        } else if (now.getTime() < date.getTime()) {
            return "IN " + Math.ceil((date.getTime() - now.getTime()) / 1000 / 60 / 60 / 24) + " DAYS";
        } else {
            return "NOW";
        }
    }

    const setColorRed = () => { setItemStyle("bg-rose-700 flex justify-between text-white w-4/5 h-1/6 mt-2 mb-2 text-xl"); }
    const setColorGreen = () => { setItemStyle("bg-emerald-700 flex justify-between text-white w-4/5 h-1/6 mt-2 mb-2 text-xl"); }

    return (
        <div
            className={itemStyle}
            id={id}
        >
            <div className="flex items-center justify-center" contentEditable={true} onChange={(newText) => setText(newText)} suppressContentEditableWarning={true}>
                {text}
            </div>
            <div className="flex items-end justify-end text-black">
                <DatePicker onChange={(date) => { setStartDate(date); setDateText(getTimeDifference(date)); }} placeholderText={dateText} />
            </div>
            <div className="flex">
                <span id="red" className="border-2 h-10 w-10 bg-rose-700" onClick={setColorRed}></span>
                <span id="blue" className="border-2 h-10 w-10 bg-emerald-700" onClick={setColorGreen}></span>
            </div>
            <div onClick={() => deleteClick(id)} className="flex justify-end">
                X
            </div>
        </div>
    );
}

export default DaysSinceItem;
