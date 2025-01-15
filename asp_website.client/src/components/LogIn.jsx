import React, { useState } from "react";
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
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        const token = await loginUser({
            username,
            password
        });

        if (token != null && token !== "") {
            console.log("Logon successful. Received token from server: ");
            console.log(token);
            const errorDiv = document.getElementById("errorMessage");
            if (errorDiv != null) {
                errorDiv.style.visibility = 'hidden';
            }

            // TODO: Navigate to a success page
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
            <form onSubmit={handleSubmit}>
                <label>
                    <p>Username</p>
                    <input type="text" onChange={e => setUsername(e.target.value)} className="border-2" autoComplete="name" />
                </label>
                <label className="p-10">
                    <p>Password</p>
                    <input type="password" onChange={e => setPassword(e.target.value)} className="border-2" autoComplete="password" />
                </label>
                <label>
                    <div className="">
                        <button type="submit" className="bg-slate-300 p-1 px-2">Submit</button>
                    </div>
                </label>
            </form>
        </div>
    );
}

LogIn.propTypes = {
    setToken: PropTypes.func.isRequired
}
