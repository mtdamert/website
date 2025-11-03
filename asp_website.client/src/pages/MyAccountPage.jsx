import MyAccount from '../components/MyAccount';
import useToken from '../components/useToken';

function MyAccountPage(props) {
    const { setToken } = useToken(props.updateAppToken);

    return (
        <div className="page">
            <MyAccount username={props.username} emailAddress={props.emailAddress} setToken={setToken} />
        </div>
    )
}

export default MyAccountPage;
