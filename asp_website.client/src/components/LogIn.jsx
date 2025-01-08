import React, { useState } from "react";
import PropTypes from 'prop-types';

async function loginUser(credentials) {
    return fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
        .then(data => data.json())
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

        setToken(token);
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
