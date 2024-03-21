import { useState } from "react";
import DaysSinceItem from "./DaysSinceItem";

function DaysSince() {
    const [items, setItems] = useState([]);

    const addItem = () => {
        setItems([
            ...items,
            new DaysSinceItem("New Item", false)
        ]);
        items.push(new DaysSinceItem("New Item", false));
    }

    return (
        <div className="items-center border w-screen h-screen">
            {
                items.map(
                    (item) =>
                    { return <DaysSinceItem name={item.name} isFinished={item.isFinished} />; }
                )}
            <button id="addItemButton" onClick={addItem} className="text-[#0a9ef0] bg-[#c0c0c0] px-3 py-1 rounded-md">Add Item</button>
        </div>
        
    );
}

export default DaysSince;
