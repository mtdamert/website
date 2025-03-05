import React, { useState } from "react";

async function emailServer(emailContents) {
    console.log("Attempting to send request to server");

    const fetchToken = await fetch('contact', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailContents)
    });


    console.log("Finished attempting to send request to server");
}


function Contact({ username, emailAddress }) {
    const [sender, setSender] = useState(username);
    const [email, setEmail] = useState(emailAddress);
    const [body, setBody] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const mailResult = await emailServer({
            sender,
            email,
            body
        });
    }

    const showUsername = (username) => {
        return (username !== null && username !== "") ? <span className="italic text-gray-500">{username}</span>
            : <input type="text" id="sender" className="border-2" onChange={e => setSender(e.target.value)} />;
    }

    return (
        <div>
            <div>
                <h1>Send Mike an Email</h1>
            </div>
            <form onSubmit={handleSubmit} className="p-2 bg-blue-200">
                <div>
                    <p>Your Name</p>
                    { showUsername(username) }
                </div>
                <div>
                    <p>Message</p>
                    <textarea rows="5" cols="80" id="body" className="border-2" onChange={e => setBody(e.target.value)} />
                </div>
                <div className="pt-8 float-center">
                    <button type="submit" className="bg-gray-100 p-1 px-2 float-center">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default Contact;
