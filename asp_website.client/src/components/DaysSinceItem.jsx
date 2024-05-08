import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function DaysSinceItem({ name, setName, isFinished, id, deleteClick }) {
    const itemColor = isFinished ? 'bg-rose-700' : 'bg-emerald-700';
    const itemStyleMinusColor = " col-span-4 justify-between text-white grid w-full mt-2 mb-2 text-xl rounded-md";

    const [startDate, setStartDate] = useState(new Date());
    const [text, setText] = useState(name);
    const [dateText, setDateText] = useState("NOW");
    const [itemStyle, setItemStyle] = useState(itemColor + itemStyleMinusColor);

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

    const setColorRed = () => { setItemStyle("bg-rose-700 " + itemStyleMinusColor); }
    const setColorGreen = () => { setItemStyle("bg-emerald-700 " + itemStyleMinusColor); }

    return (
        <div
            className={itemStyle}
            id={id}
        >
            <div onClick={() => deleteClick(id)} className="grid col-start-2 justify-end">
                <button>X</button>
            </div>
            <div className="items-center justify-center grow" contentEditable={true} onInput={e => { console.log('Text inside div', e.currentTarget.textContent); setText(e.currentTarget.textContent); setName(e.currentTarget.textContent); } } suppressContentEditableWarning={true}>
                {text}
            </div>
            <div className="basis-full h-0"></div>
            <div className="justify-center grow col-start-2">
                <span>when: </span>
                <span className="text-black font-bold"><DatePicker onChange={(date) => { setStartDate(date); setDateText(getTimeDifference(date)); }} placeholderText={dateText} /></span>
            </div>
            <div className="w-24 h-10 col-start-2 inline-block">
                <span id="red" className="border-2 h-10 w-10 bg-rose-700 inline-block" onClick={setColorRed}></span>
                <span id="blue" className="border-2 h-10 w-10 bg-emerald-700 inline-block" onClick={setColorGreen}></span>
            </div>
        </div>
    );
}

export default DaysSinceItem;
