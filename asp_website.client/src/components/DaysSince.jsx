import { useState, useEffect } from "react";
import DaysSinceItem from "./DaysSinceItem";

function DaysSince() {
    const [items, setItems] = useState([]);
    const [itemCounter, setItemCounter] = useState(1);
    const [name, setName] = useState("New Item");

    const addItem = (counter) => {
        setItems([
            ...items,
            { name: name, setName: setName, isFinished: false, id: counter, key: counter }
        ]);

        console.log("Added a new item. Name: " + name + ", id: " + counter);
    }

    const addItemWithInfo = (counter, itemName, isItemFinished) => {
        setItems([
            ...items,
            { name: itemName, setName: setName, isFinished: isItemFinished, id: counter, key: counter }
        ]);

        console.log("Added a new item. Name: " + itemName + ", id: " + counter);
    }

    const deleteItem = (id) => {
        setItems([ ...items.filter(item => item.id !== id) ]);
    }

    const loadItems = async () => {
        const response = await fetch('dayssinceevents');
        const data = await response.json();

        console.log("loadItems data: " + data);

        data.map(
            item => {
                addItemWithInfo(itemCounter, item.eventName, item.isFinished);
                setItemCounter(itemCounter + 1);
                return itemCounter;
            }
        );

        return response;
    }

    useEffect(() => {
        loadItems();
    }, []);

    const saveItems = async (items) => {
        console.log("trying to save data to server: " + JSON.stringify(items));

        const fetchSendDaysSinceEvents = fetch('dayssinceevents', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(items)
        })

        return fetchSendDaysSinceEvents;
    }


    return (
        <div>
            <div class="title">Days Since</div>
            <div className="border w-screen h-screen content-normal grid justify-between grid-cols-4 grid-rows-6">
                {
                    items.map(
                        item => (
                            <DaysSinceItem name={item.name + item.id} setName={setName} isFinished={item.isFinished} id={item.id} deleteClick={deleteItem} key={item.key} />
                                )
                    )}
                <button id="addItemButton" onClick={() => { addItem(itemCounter); setItemCounter(itemCounter + 1); }} className="w-1/6 h-10 col-span-3 text-blue-500 font-bold bg-[#c0c0c0] px-3 py-1 rounded-md">Add Item</button>
                <button id="saveItemsButton" onClick={() => saveItems(items)} className="w-1/2 h-10 text-blue-500 font-bold bg-[#c0c0c0] px-3 py-1 rounded-md">Save Items</button>
            </div>
        </div>
    );
}

export default DaysSince;
