import { useEffect, useState } from 'react';
import Tooltip from './Tooltip';

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

    const firstFunc = () => {
        return 'hello ';
    }

    const secondFunc = () => {
        return firstFunc() + 'world';
    }

    return (
        <div className="flex items-center px-3 py-1.5 border">
            <div>
                Test test test
            </div><br />
            <div>{secondFunc()}</div><br />
            <div className="pt-2">{testDataContent}</div>
            <div>
                <Tooltip altText="Test tooltip" />
            </div>
        </div>
    );
}

export default Test;
