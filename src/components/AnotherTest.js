function AnotherTest() {
    const firstFunc = () => {
        return 'hello ';
    }

    const secondFunc = () => {
        return firstFunc() + 'world';
    }

    return (
        <div className="flex items-center px-3 py-1.5 border">
            Second test<br />
            {secondFunc()}
        </div>
    );
}

export default AnotherTest;
