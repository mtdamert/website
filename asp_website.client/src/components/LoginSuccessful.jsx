import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function LoginSuccessful({onLoad}) {
    const location = useLocation();
    const data = location.state;

    useEffect(() => {
        onLoad();
    });

    const getIntro = (username) => {
        if (username !== '')
            return <div>Hi <b>{username}</b></div>;
        else
            return <></>;
    }

    return (
        <div>
            <div>
                {data.message}
            </div>
                {getIntro(data.username)}
        </div>
    );
}

export default LoginSuccessful;
