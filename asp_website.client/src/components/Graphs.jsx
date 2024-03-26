import graph_history from './graph_history.json';
import { BarChart, Bar, Rectangle, XAxis } from 'recharts';

function Graphs() {
    const myFile = graph_history;
    const data = [
        {
            name: 'Page A',
            uv: 4000,
            pv: 2400,
            amt: 2400,
        },
        {
            name: 'Page B',
            uv: 3000,
            pv: 1398,
            amt: 2210,
        },
        {
            name: 'Page C',
            uv: 2000,
            pv: 9800,
            amt: 2290,
        },
        {
            name: 'Page D',
            uv: 2780,
            pv: 3908,
            amt: 2000,
        },
        {
            name: 'Page E',
            uv: 1890,
            pv: 4800,
            amt: 2181,
        },
        {
            name: 'Page F',
            uv: 2390,
            pv: 3800,
            amt: 2500,
        },
        {
            name: 'Page G',
            uv: 3490,
            pv: 4300,
            amt: 2100,
        },
    ];

    var el = { name: "Addition", uv: 3000, pv: 3000, amt: 2000 };
    data.push(el);

    return (
        <div className="flex items-center px-3 py-1.5 border">
            (todo) {myFile.data[0].Date}

            <BarChart width={400} height={300} data={data}>
                <Bar dataKey="pv" fill="#4494e5" activeBar={<Rectangle fill="red" stroke="red" />} />
                <XAxis dataKey="name" />
            </BarChart>
        </div>
    );
}

export default Graphs;
