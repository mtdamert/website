import { useState, createContext, useContext } from "react";
import DaysSinceItem from "./DaysSinceItem";

function DaysSince() {
    const [items, setItems] = useState([]);
    const [itemCounter, setItemCounter] = useState(1);
    const [name, setName] = useState("New Item");

    const ItemContext = createContext(null);

    const addItem = (counter) => {
        setItems([
            ...items,
            { name: name, setName: setName, isFinished: false, id: counter, key: counter }
        ]);

        setItemCounter(counter + 1);
    }

    const deleteItem = (id) => {
        setItems([ ...items.filter(item => item.id !== id) ]);
    }

    const saveItems = (items) => {
        // TODO: Save items
        console.log("TODO: Save items to cookies? Or to database?");
        setName("foo");

        items.map(
            item => (console.log(name + ", is finished: " + item.isFinished))
            );
    }

    return (
        <div className="border w-screen h-screen content-normal grid justify-between grid-cols-4 grid-rows-6">
            {
                items.map(
                    item => (
                        <ItemContext.Provider value="foo" key={item.key + "_provider"}>
                            <DaysSinceItem name={item.name + item.id} setName={setName} isFinished={item.isFinished} id={item.id} deleteClick={deleteItem} key={item.key} />
                        </ItemContext.Provider>
                            )
                )}
            <button id="addItemButton" onClick={() => addItem(itemCounter)} className="w-1/6 h-10 col-span-3 text-blue-500 font-bold bg-[#c0c0c0] px-3 py-1 rounded-md">Add Item</button>
            <button id="saveItemsButton" onClick={() => saveItems(items)} className="w-1/2 h-10 text-blue-500 font-bold bg-[#c0c0c0] px-3 py-1 rounded-md">Save Items</button>
        </div>
        
    );
}

export default DaysSince;
