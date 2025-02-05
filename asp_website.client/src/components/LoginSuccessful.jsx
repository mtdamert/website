import { useLocation } from 'react-router-dom';

function LoginSuccessful() {
    const location = useLocation();
    const data = location.state;

    console.log('data.username: ');
    console.log(data.username);

    // TODO: This isn't rendering properly
    const getIntro = (username) => {
        if (username !== '')
            return 'Hi ' + <b>username</b> + '. ';
        else
            return <></>;
    }

    return (
        <div>
            {getIntro(data.username)}{data.message}
        </div>
    );
}

export default LoginSuccessful;
