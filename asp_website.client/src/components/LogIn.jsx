import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

async function loginUser(credentials) {
    console.log("sending to server: " + JSON.stringify(credentials));

    const fetchToken = await fetch('logoninfo', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    });

    if (fetchToken.status == 401) {
        // TODO: Redirect to a 'bad logon' page
        console.log("Bad username and/or password");
        return "";
    }

    const token = await fetchToken.text();
    return token;
}

export default function LogIn({ setToken }) {
    const username = "";
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = await loginUser({
            username,
            emailAddress,
            password
        });

        if (token != null && token !== "") {
            console.log("Logon successful. Received token from server: ");
            console.log(token);
            const errorDiv = document.getElementById("errorMessage");
            if (errorDiv != null) {
                errorDiv.style.visibility = 'hidden';
            }

            // Navigate to a success page
            const successData = { message: 'Login successful', email: emailAddress };
            navigate('/login-successful', { state: successData });

            setToken(token);
        } else {
            // Not successful; log an attempt and let the user try again
            const errorDiv = document.getElementById("errorMessage");
            if (errorDiv != null) {
                errorDiv.style.visibility = 'visible';
            }
        }
    }

    return (
        <div className="login-wrapper">
            <h1 className="font-bold">Please log in</h1>
            <div id="errorMessage" className="invisible text-rose-600">Logon unsuccessful. Please check your username and/or password</div>
            <form onSubmit={handleSubmit} className="p-2 bg-blue-200">
                <div>
                    <p>Email Address</p>
                    <input type="email" onChange={e => setEmailAddress(e.target.value)} className="border-2" autoComplete="name" />
                </div>
                <div>
                    <p>Password</p>
                    <input type="password" onChange={e => setPassword(e.target.value)} className="border-2" autoComplete="password" />
                </div>
                <div className="py-2">
                    <p className="float-right justify-baseline text-sm">Forgot password? (TODO)</p>
                </div>
                <div className="pt-4">
                    <span className="float-right text-sm">No password? <Link to="/sign-up" className="mb-3 font-bold h-full text-blue-500">Sign up</Link></span>
                </div>
                <div className="pt-8 float-center">
                    <button type="submit" className="bg-gray-100 p-1 px-2 float-center rounded-md">Submit</button>
                </div>
            </form>
        </div>
    );
}

LogIn.propTypes = {
    setToken: PropTypes.func.isRequired
}
