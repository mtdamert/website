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
        <div class="content">
            <div class="title">Send Mike an Email</div>
            <form onSubmit={handleSubmit} class="form-background">
                <div className="pb-2">
                    <p>Your Name</p>
                    { showUsername(username) }
                </div>
                <div>
                    <p>Message</p>
                    <textarea rows="8" cols="100" id="body" className="border-2" onChange={e => setBody(e.target.value)} />
                </div>
                <div className="pt-8 place-self-center">
                    <button type="submit">Send</button>
                </div>
            </form>
        </div>
    );
}

export default Contact;
