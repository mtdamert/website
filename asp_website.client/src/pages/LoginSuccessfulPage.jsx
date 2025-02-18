import LoginSuccessful from '../components/LoginSuccessful';

function LoginSuccessfulPage(e) {
    return (
        <div className="flex">
            <LoginSuccessful onLoad={e.onLoad} />
        </div>
    )
}

export default LoginSuccessfulPage;
