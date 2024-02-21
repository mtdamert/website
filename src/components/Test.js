import Tooltip from './Tooltip';

function Test() {
    const firstFunc = () => {
        return 'hello ';
    }

    const secondFunc = () => {
        return firstFunc() + 'world';
    }

    return (
        <div className="flex items-center px-3 py-1.5 border">
            <div>
                Test test test<Tooltip text="test tooltip" />
            </div>
            <div>{secondFunc()}</div>
        </div>
    );
}

export default Test;
