
// TODO: Last Date
// TODO: Color (green/red)
// TODO: Name

function DaysSinceItem({ name, isFinished, id, deleteClick }) {
    const itemColor = isFinished ? 'bg-rose-700' : 'bg-emerald-700';
    const divClass = itemColor + " flex justify-between text-white w-4/5 h-1/6 mt-2 mb-2 text-xl";

    return (
        <div
            className={divClass}
            id={id}
        >
            <div className="flex items-center justify-center" contentEditable={true}>{name}</div>
            <div onClick={() => deleteClick(id)} className="flex justify-end">X</div>
        </div>
    );
}

export default DaysSinceItem;
