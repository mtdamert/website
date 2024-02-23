import graph_history from './graph_history.json';

function Graphs() {
    const myFile = graph_history;
    
    return (
        <div className="flex items-center px-3 py-1.5 border">(todo) {myFile.data[0].Date}</div>
    );
}

export default Graphs;
