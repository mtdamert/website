import ConfirmEmail from '../components/ConfirmEmail';
import useToken from '../components/useToken';

function ConfirmEmailPage(props) {
    const { setToken } = useToken(props.updateAppToken);

    return (
        <div className="flex h-full">
            <ConfirmEmail username={props.username} setToken={setToken} />
        </div>
    )
}

export default ConfirmEmailPage;
