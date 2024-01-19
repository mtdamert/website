import Sidebar from './components/Sidebar';
import Route from './components/Route';
import AboutPage from './pages/AboutPage'
import AnotherTestPage from './pages/AnotherTestPage';
import TestPage from './pages/TestPage';
import TetrisPage from './pages/TetrisPage';

function App() {
    return (
        <div className="justify-center">
            <div className="text-2xl py-6 px-4 text-center">
                mtdamert.com
            </div>

            <div className="container mx-auto gap-4 mt-4 ">
                <Sidebar />
            </div>

            {/* put the rest of the page here */}
            <div className="h-full py-6 px-6 fixed">
                <Route path="/another-test">
                    <AnotherTestPage />
                </Route>
                <Route path="/test">
                    <TestPage />
                </Route>
                <Route path="/tetris">
                    <TetrisPage />
                </Route>
                <Route path="/about">
                    <AboutPage />
                </Route>
            </div>            
        </div>
    );
}

export default App;
