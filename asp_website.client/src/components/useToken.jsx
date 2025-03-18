import { useState } from 'react';

export default function useToken(updateAppToken) {
    const getToken = () => {
        const tokenString = localStorage.getItem('token');
        const userToken = JSON.parse(tokenString);

        return userToken?.token;
    };

    const [token, setToken] = useState(getToken());

    const saveToken = (userToken) => {
        localStorage.setItem('token', JSON.stringify(userToken));
        console.log("useToken is setting the token as: " + userToken);

        // TODO: Force full app refresh so we have the correct capabilities for this token
        // TODO: Token should be stored at the App level, not here
        updateAppToken(userToken);
        setToken(userToken);
    };

    return {
        setToken: saveToken,
        token
    }
}
