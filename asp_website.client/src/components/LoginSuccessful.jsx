import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function LoginSuccessful({onLoad}) {
    const location = useLocation();
    const data = location.state;

    useEffect(() => {
        onLoad();
    });

    const getIntro = (email) => {
        if (email !== '')
            return <div>Hi <b>{email}</b></div>;
        else
            return <></>;
    }

    return (
        <div>
            <div>
                {data.message}
            </div>
            {getIntro(data.email)}
        </div>
    );
}

export default LoginSuccessful;
