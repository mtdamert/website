import { useState } from "react";
import DaysSinceItem from "./DaysSinceItem";

function DaysSince() {
    const [items, setItems] = useState([]);
    const [itemCounter, setItemCounter] = useState(1);

    const addItem = (counter) => {
        setItems([
            ...items,
            { name: "New Item", isFinished: false, id: counter, key: counter }
        ]);

        setItemCounter(counter + 1);
    }

    const deleteItem = (id) => {
        setItems([ ...items.filter(item => item.id !== id) ]);
    }

    return (
        <div className="items-center border w-screen h-screen">
            {
                items.map(
                    item => (<DaysSinceItem name={item.name + item.id} isFinished={item.isFinished} id={item.id} deleteClick={deleteItem} key={item.key} /> )
                )}
            <button id="addItemButton" onClick={() => addItem(itemCounter) } className="text-[#0a9ef0] bg-[#c0c0c0] px-3 py-1 rounded-md">Add Item</button>
        </div>
        
    );
}

export default DaysSince;
