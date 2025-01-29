import React, { useState } from "react";

async function addNewUser(credentials) {
    console.log("sending to server: " + JSON.stringify(credentials));

    const success = await fetch('adduser', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    });
}

function SignUp(credentials) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // TODO: Add a new user
        const token = await addNewUser({
            username,
            password
        });

        // TODO: Redirect to the previous page? Or to the logon page?
    }

    return (
        <div>
            <h1 className="font-bold">Add a New User</h1>
            <form onSubmit={handleSubmit} className="p-2 pb-6 bg-blue-200">
                <div className="pb-2">Enter a new username and password</div>
                <div>
                    <p>Username</p>
                    <input type="text" onChange={e => setUsername(e.target.value)} className="border-2" autoComplete="name" />
                </div>
                <div>
                    <p>Password</p>
                    <input type="password" onChange={e => setPassword(e.target.value)} className="border-2" autoComplete="password" />
                </div>
                <div className="py-4">
                    <button type="submit" className="bg-gray-100 p-1 px-2 float-right">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default SignUp;
