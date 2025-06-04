import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function ConfirmEmail({ username, setToken }) {

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    let id = searchParams.get('id');
    if (id === null || id === "")
        id = "4";
    let guid = searchParams.get('emailConfirmationGuid');
    if (guid === null || guid === "")
        guid = "nope";

    const confirmMessage = useRef("");

    //const postData = async () => {
    //    console.log("attempted to POST");
    //};

    const postData = async () => {
        try {
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

            const token = await response.text();
            if (!token == "") {
                console.log('Email confirmation process successfully ran. Message from server:', token);
                confirmMessage.current = "Thank you. Your account has been successfully confirmed";
                setToken(token);
            } else {
                console.log('Email confirmation unsuccessful. Was this account valid?');
            }
        } catch (error) {
            console.error('Error! Message from server:', error);
            confirmMessage.current = "I'm sorry. There was an error trying to confirm your account";
        }
    };

    useEffect(() => {
        postData();
    }, []);


    return (
        <div>
            <div className="mb-4">Confirm Email page reached for {username}</div>
            <div>{confirmMessage.current}</div>
        </div>
    );
}

export default ConfirmEmail;
