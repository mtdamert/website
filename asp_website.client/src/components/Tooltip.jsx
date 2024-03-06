import Popup from 'reactjs-popup';

function Tooltip({ altText }) {

    return (<Popup
            trigger={<div className="menu-item text-cyan-500"> ? </div>}
            position="right top"
            on="hover"
            closeOnDocumentClick
            mouseLeaveDelay={300}
            mouseEnterDelay={0}
            contentStyle={{ padding: '0px', border: 'none' }}
            arrow={false}
            >
        <span className="border bg-slate-100 p-0.5"> {altText} </span>
    </Popup>);
}

export default Tooltip;
