import LogIn from '../components/LogIn';
import useToken from '../components/useToken';

function LogInPage(props) {
    const { setToken } = useToken(props.updateAppToken);

    return (
        <div className="page">
            <LogIn setToken={ setToken } />
        </div>
    )
}

export default LogInPage;
