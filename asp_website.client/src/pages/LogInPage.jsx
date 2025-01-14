import LogIn from '../components/LogIn';
import useToken from '../components/useToken';

function LogInPage() {
    const { setToken } = useToken();

    return (
        <div className="flex">
            <LogIn setToken={ setToken } />
        </div>
    )
}

export default LogInPage;
