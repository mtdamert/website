import Header from './components/Header';
import { useEffect } from "react";
import AboutPage from './pages/AboutPage'
import TestPage from './pages/TestPage';
import TetrisPage from './pages/TetrisPage';
import GraphsPage from './pages/GraphsPage';
import RetirementCalcPage from './pages/RetirementCalcPage';
import DaysSincePage from './pages/DaysSincePage';

import CookieConsent from "react-cookie-consent";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const headerText = [
    "mtdamert.com",
    "いらっしゃいませ！",
    "Website!",
    "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧"
];

function App() {
    const getHeaderText = () => {
        const random = Math.floor(Math.random() * headerText.length);
        return headerText[random];
    }

    useEffect(() => {
        document.title = 'mtdamert.com';
        }, []);
    
    return (
        <div className="justify-center">

            <CookieConsent
                location="bottom"
                buttonText="I agree"
                cookieName="myAppCookieConsent"
                style={{ background: "#2B373B" }}
                buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
                expires={150}
            >
                This website uses cookies to enhance the user experience.
            </CookieConsent>

            <div className="text-4xl py-4 px-4 text-center">
                {getHeaderText()}
            </div>
            <div>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Header />}>
                            <Route path="/test" element={<TestPage />} />
                            <Route path="/tetris" element={<TetrisPage />} />
                            <Route path="/graphs" element={<GraphsPage />} />
                            <Route path="/retirement-calc" element={<RetirementCalcPage />} />
                            <Route path="/days-since" element={<DaysSincePage />} />
                            <Route path="/about" element={<AboutPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </div>
        </div>
    );
}

export default App;
