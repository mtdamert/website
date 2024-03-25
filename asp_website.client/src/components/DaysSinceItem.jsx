
// TODO: Last Date
// TODO: Color (green/red)
// TODO: Name

function DaysSinceItem({ name, isFinished, id, deleteClick }) {
    const itemColor = isFinished ? 'bg-rose-700' : 'bg-emerald-700';
    const divClass = itemColor + " text-white w-4/5 h-1/6 mt-2 mb-2 text-xl";

    return (
        <div
            
            className={divClass}
            id={id}
        >
            <span contentEditable={true}>{name}</span>
            <span onClick={() => deleteClick(id)} className="float-right">X</span>
        </div>
    );
}

export default DaysSinceItem;
