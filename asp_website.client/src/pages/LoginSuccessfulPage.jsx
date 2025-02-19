import LoginSuccessful from '../components/LoginSuccessful';

function LoginSuccessfulPage(props) {
    return (
        <div className="flex">
            <LoginSuccessful onLoad={props.onLoad} />
        </div>
    )
}

export default LoginSuccessfulPage;
