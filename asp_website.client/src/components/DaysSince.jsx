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

    const saveItems = () => {
        // TODO: Save items
        console.log("TODO: Save items to cookies? Or to database?");
    }

    return (
        <div className="border w-screen h-screen content-normal grid justify-between grid-cols-4 grid-rows-6">
            {
                items.map(
                    item => (<DaysSinceItem name={item.name + item.id} isFinished={item.isFinished} id={item.id} deleteClick={deleteItem} key={item.key} /> )
                )}
            <button id="addItemButton" onClick={() => addItem(itemCounter)} className="w-1/6 h-10 col-span-3 text-blue-500 font-bold bg-[#c0c0c0] px-3 py-1 rounded-md">Add Item</button>
            <button id="saveItemsButton" onClick={() => saveItems()} className="w-1/2 h-10 text-blue-500 font-bold bg-[#c0c0c0] px-3 py-1 rounded-md justify-end">Save Items</button>
        </div>
        
    );
}

export default DaysSince;
