import React, { useState } from "react";

async function emailServer(emailContents) {
    const fetchToken = await fetch('contact', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailContents)
    });

}


function Contact() {
    const [emailerName, setEmailerName] = useState("");
    const [emailBody, setEmailBody] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = await emailServer({
            emailerName,
            emailBody
        });
    }

    return (
        <div>
            <div>
                <h1>Send Mike an Email</h1>
            </div>
            <form onSubmit={handleSubmit} className="p-2 bg-blue-200">
                <div>
                {/* TODO: If the user is logged in, don't display the name field and use their username instead */}
                    <p>Your Name</p>
                    <input type="text" id="EmailerName" className="border-2" onChange={e => setEmailerName(e.target.value)} />
                </div>
                <div>
                    <p>Message</p>
                    <textarea rows="5" cols="80" id="EmailBody" className="border-2" onChange={e => setEmailBody(e.target.value)} />
                </div>
                <div className="pt-8 float-center">
                    <button type="submit" className="bg-gray-100 p-1 px-2 float-center cursor-not-allowed opacity-50" disabled>Submit</button>
                    <span>(form not implemented yet)</span>
                </div>
            </form>
        </div>
    );
}

export default Contact;
