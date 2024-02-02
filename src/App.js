import Header from './components/Header';
import Route from './components/Route';
import AboutPage from './pages/AboutPage'
import AnotherTestPage from './pages/AnotherTestPage';
import TestPage from './pages/TestPage';
import TetrisPage from './pages/TetrisPage';
import GraphsPage from './pages/GraphsPage';
import RetirementCalcPage from './pages/RetirementCalcPage';

const headerText = [
    "mtdamert.com",
    "いらっしゃいませ！",
    "Website!"
];

function App() {
    const getHeaderText = () => {
        const random = Math.floor(Math.random() * headerText.length);
        return headerText[random];
    }

    return (
        <div className="justify-center">
            <div className="text-4xl py-4 px-4 text-center">
                {getHeaderText()}
            </div>

            <div className="container mx-auto gap-2 mt-4 ">
                <Header />
            </div>

            {/* put the rest of the page here
            
            <div className="h-full py-6 px-6 fixed">
            */}
            <div>
                <Route path="/another-test">
                    <AnotherTestPage />
                </Route>
                <Route path="/test">
                    <TestPage />
                </Route>
                <Route path="/tetris">
                    <TetrisPage />
                </Route>
                <Route path="/graphs">
                    <GraphsPage />
                </Route>
                <Route path='/retirement-calc'>
                    <RetirementCalcPage />
                </Route>
                <Route path="/about">
                    <AboutPage />
                </Route>
            </div>            
        </div>
    );
}

export default App;
