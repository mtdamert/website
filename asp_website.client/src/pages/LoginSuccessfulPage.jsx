import LoginSuccessful from '../components/LoginSuccessful';

function LoginSuccessfulPage(props) {
    return (
        <div className="page">
            <LoginSuccessful onLoad={props.onLoad} />
        </div>
    )
}

export default LoginSuccessfulPage;
