import { useState } from "react";
import DaysSinceItem from "./DaysSinceItem";

function DaysSince() {
    const [items, setItems] = useState([]);
    const [itemCounter, setItemCounter] = useState(1);

    const addItem = (counter) => {
        setItems([
            ...items,
            new DaysSinceItem("New Item", false, counter)
        ]);

        console.log("Adding new item to queue: " + counter);
        setItemCounter(counter + 1);
    }

    const deleteItem = (id) => {
        console.log("Trying to delete item: " + id);
        items.filter(a => a.id !== id);
    }

    return (
        <div className="items-center border w-screen h-screen">
            {
                items.map(
                    (item) =>
                    { return <DaysSinceItem name={item.name} isFinished={item.isFinished} id={item.itemCounter} deleteClick={deleteItem} />; }
                )}
            <button id="addItemButton" onClick={() => addItem({ itemCounter })} className="text-[#0a9ef0] bg-[#c0c0c0] px-3 py-1 rounded-md">Add Item</button>
        </div>
        
    );
}

export default DaysSince;
