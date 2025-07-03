import SignUp from '../components/SignUp';
import useToken from '../components/useToken';

function SignUpPage(props) {
    console.log("In SignUpPage, I see that props.updateApp type is: " + typeof props.updateApp);
    const { setToken } = useToken(props.updateAppToken);

    return (
        <div class="page">
            <SignUp setToken={setToken} />
        </div>
    )
}

export default SignUpPage;
