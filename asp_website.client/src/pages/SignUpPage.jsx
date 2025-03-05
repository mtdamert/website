import SignUp from '../components/SignUp';
import useToken from '../components/useToken';

function SignUpPage() {
    const { setToken } = useToken();

    return (
        <div className="flex">
            <SignUp setToken={setToken} />
        </div>
    )
}

export default SignUpPage;
