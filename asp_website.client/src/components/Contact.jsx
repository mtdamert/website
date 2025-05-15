import React, { useState, useRef } from "react";

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
    const email = useRef(emailAddress).current;
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
            <div class="title">Send Mike an Email</div>
            <form onSubmit={handleSubmit} className="my-2 p-4 bg-blue-200 rounded-md">
                <div>
                    <p>Your Name</p>
                    { showUsername(username) }
                </div>
                <div>
                    <p>Message</p>
                    <textarea rows="8" cols="100" id="body" className="border-2" onChange={e => setBody(e.target.value)} />
                </div>
                <div className="pt-8 float-center">
                    <button type="submit" className="rounded-md px-4 py-2 outline-2 outline-black outline-offset-2 bg-orange-200">Send</button>
                </div>
            </form>
        </div>
    );
}

export default Contact;
