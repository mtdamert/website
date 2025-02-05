import Header from './components/Header.jsx';
import { useEffect } from "react";
import AboutPage from './pages/AboutPage.jsx'
import TestPage from './pages/TestPage.jsx';
import TetrisPage from './pages/TetrisPage.jsx';
import ArkanoidPage from './pages/ArkanoidPage.jsx';
import RetirementCalcPage from './pages/RetirementCalcPage.jsx';
import ArtPage from './pages/ArtPage.jsx';
import DaysSincePage from './pages/DaysSincePage.jsx';
import LogInPage from './pages/LogInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginSuccessfulPage from './pages/LoginSuccessfulPage.jsx';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CookieConsent from "react-cookie-consent";

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
            <BrowserRouter>

                <div className="float-right px-4">
                    <Link key="Log In" to='/login' className="mb-3 font-bold h-full text-blue-500">Log In</Link>
                </div>

                <div className="text-4xl py-4 px-4 text-center">
                    {getHeaderText()}
                </div>
                <div>
                    <Routes>
                        <Route path="/" element={<Header />}>
                            <Route path="/test" element={<TestPage />} />
                            <Route path="/tetris" element={<TetrisPage />} />
                            <Route path="/arkanoid" element={<ArkanoidPage />} />
                            <Route path="/retirement-calc" element={<RetirementCalcPage />} />
                            <Route path="/art" element={<ArtPage />} />
                            <Route path="/days-since" element={<DaysSincePage /> } />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/login" element={<LogInPage />} />
                            <Route path="/sign-up" element={<SignUpPage />} />
                            <Route path="/login-successful" element={<LoginSuccessfulPage />} />
                        </Route>
                    </Routes>
                </div>

            </BrowserRouter>
        </div>
    );
}

export default App;
