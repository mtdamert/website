import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

async function addNewUser(credentials) {
    console.log("sending to server: " + JSON.stringify(credentials));

    const fetchToken = await fetch('adduser', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    });

    const token = await fetchToken.text();
    return token;
}

function SignUp({ setToken }) {
    const [username, setUsername] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // TODO: Add a new user
        const token = await addNewUser({
            username,
            emailAddress,
            password
        });

        console.log("result from server: ");
        console.log(token);

        // TODO: Redirect to the previous page? Or to the logon page?
        if (token != null && token !== "") {
            console.log("User created. Received token from server: ");
            console.log(token);
            const errorDiv = document.getElementById("errorMessage");
            if (errorDiv != null) {
                errorDiv.style.visibility = 'hidden';
            }

            // TODO: Move to a different page
            const successData = { message: 'Login successful', email: emailAddress };
            navigate('/login-successful', { state: successData });

            setToken(token);
        } else { // probably 401
            console.log("Adding new user unsuccessful. Does this user already exist?");
            const errorDiv = document.getElementById("errorMessage");
            if (errorDiv != null) {
                errorDiv.style.visibility = 'visible';
            }
        }
    }

    return (
        <div>
            <h1 className="font-bold">Add a New User</h1>
            <div id="errorMessage" className="invisible text-rose-600">Unable to create new user. Is this user already in the system?</div>
            <form onSubmit={handleSubmit} className="p-2 pb-6 bg-blue-200">
                <div className="pb-2">Enter your info here:</div>
                <div>
                    <p>Username</p>
                    <input type="text" onChange={e => setUsername(e.target.value)} className="border-2" autoComplete="name" />
                </div>
                <div>
                    <p>Email Address</p>
                    <input type="email" onChange={e => setEmailAddress(e.target.value)} className="border-2" autoComplete="email" />
                </div>
                <div>
                    <p>Password</p>
                    <input type="password" onChange={e => setPassword(e.target.value)} className="border-2" autoComplete="password" />
                </div>
                <div className="py-4">
                    <button type="submit" className="bg-gray-100 p-1 px-2 float-right rounded-md">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default SignUp;
