import LoginSuccessful from '../components/LoginSuccessful';

function LoginSuccessfulPage(props) {
    return (
        <div class="page">
            <LoginSuccessful onLoad={props.onLoad} />
        </div>
    )
}

export default LoginSuccessfulPage;
