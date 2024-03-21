
// TODO: Last Date
// TODO: Color (green/red)
// TODO: Name

function DaysSinceItem({ name, isFinished }) {
    const itemColor = isFinished ? 'bg-rose-700' : 'bg-emerald-700';
    const divClass = itemColor + " text-white w-4/5 h-1/6 mt-2 mb-2";

    return (
        <div
            className={ divClass }>
            {name}
        </div>
    );
}

export default DaysSinceItem;
