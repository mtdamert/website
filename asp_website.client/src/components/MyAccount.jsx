import React, { useState } from "react";

function MyAccount({ emailAddress, username, setToken }) {
    const [userInput, setUserInput] = useState(username);
    const [userPass, setPassInput] = useState('');
    console.log("on MyAccount JS page");

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch('updateuserinfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ emailAddress: emailAddress, username: userInput, password: userPass })
        });

        const token = await response.text();
        if (token != "") {
            setToken(token);
        }
    }

    // TODO: Make sure the username gets updated after it has been saved and this page is reloaded

    return (
        <div>
            <form onSubmit={handleSubmit} className="p-2 bg-blue-200">
                <div>
                    <span className="font-bold">Username: </span>
                    <input id="userInput" value={userInput} onChange={e => setUserInput(e.target.value)} className="border-2" />
                </div>
                <div>
                    <span className="font-bold">Password: </span>
                    <input onChange={e => setPassInput(e.target.value)} className="border-2" />
                </div>
                <div>etc.</div>
                <div className="pt-4 float-center">
                    <button type="submit" className="bg-gray-100 p-1 px-2 float-center">Update</button>
                </div>
            </form>
        </div>
    );
}

export default MyAccount;
