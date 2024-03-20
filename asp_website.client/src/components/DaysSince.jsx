import DaysSinceItem from "./DaysSinceItem";

function DaysSince() {
    const addItem = () => {
        // TODO
    }

    return (
        <div className="items-center border w-screen h-screen">
            <DaysSinceItem name="Test Item" isFinished={false} />
            <button id="addItemButton" onClick={addItem} className="text-[#0a9ef0] bg-[#c0c0c0] px-3 py-1 rounded-md">Add Item</button>
        </div>
        
    );
}

export default DaysSince;
