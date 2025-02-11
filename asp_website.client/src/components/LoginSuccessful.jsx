import { useLocation } from 'react-router-dom';

function LoginSuccessful() {
    const location = useLocation();
    const data = location.state;

    console.log('data.username: ');
    console.log(data.username);

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
