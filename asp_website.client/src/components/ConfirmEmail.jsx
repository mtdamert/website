import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ConfirmEmail({ username }) {

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    let id = searchParams.get('id');
    if (id === null || id === "")
        id = "4";
    let guid = searchParams.get('emailConfirmationGuid');
    if (guid === null || guid === "")
        guid = "nope";

    //const postData = async () => {
    //    console.log("attempted to POST");
    //};

    const postData = async () => {
        try {
            console.log("attempted to POST");
            console.log("id: " + id);
            console.log("guid: " + guid);

            const response = await fetch('confirmemail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: id, emailConfirmationGuid: guid }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.text();
            if (data.startsWith("No")) {
                console.log('Success! Message from server:', data);
            } else {
                console.log('Account not found:', data);
            }
        } catch (error) {
            console.error('Error! Message from server:', error);
        }
    };

    useEffect(() => {
        postData();
    }, []);


    return <div>Confirm Email page reached for {username}</div>
}

export default ConfirmEmail;
