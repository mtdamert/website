import { useEffect, useState } from 'react';
import Tooltip from './Tooltip';
import graph_history from './graph_history.json';
import { BarChart, Bar, Rectangle, XAxis } from 'recharts';

function Test() {
    const [testData, setTestData] = useState();

    useEffect(() => {
        populateTestData();
    }, []);

    const testDataContent = testData === undefined
        ? <p><em>Loading test data...</em></p>
        : <div>{testData}</div>

    async function populateTestData() {
        const response = await fetch('testdata');
        const data = await response.text();

        setTestData(data);
    }


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
    ];

    var el = { name: "Addition", uv: 3000, pv: 3000, amt: 2000 };
    data.push(el);


    const firstFunc = () => {
        return 'hello ';
    }

    const secondFunc = () => {
        return firstFunc() + 'world';
    }

    return (
        <div className="flex items-center px-3 py-1.5 border">
            <div className="w-full">
                Test test test
            </div>
            <div className="w-full">{secondFunc()}</div>
            <div className="pt-2">{testDataContent}</div>
            <div>
                <Tooltip altText="Test tooltip" />
            </div>

            <div className="w-full">
                (graphs todo) {myFile.data[0].Date}
            </div>
            <div className="w-full">
                <BarChart width={400} height={300} data={data}>
                    <Bar dataKey="pv" fill="#4494e5" activeBar={<Rectangle fill="red" stroke="red" />} />
                    <XAxis dataKey="name" />
                </BarChart>
            </div>
        </div>
    );
}

export default Test;
