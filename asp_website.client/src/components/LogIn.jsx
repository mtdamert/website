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
    })

    const token = await fetchToken.text();

    return await token;
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
            console.log("received token from server: ");
            console.log(token);
            // TODO: Navigate to a success page
            setToken(token);
        } else {
            // TODO: Not successful; log an attempt and let the user try again
            console.log("logon unsuccessful");
        }
    }

    return (
        <div className="login-wrapper">
            <h1 className="font-bold">Please log in</h1>
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
