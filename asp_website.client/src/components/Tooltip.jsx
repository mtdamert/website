

function Tooltip ({text}) {
    return <div class="group">
            <span className="text-teal-500">?</span>
            <span className="relative border-2 text-teal-500 invisible w-96 w-[32rem]  group-hover:visible">{text}</span>
        </div>
}

export default Tooltip;
