import ConfirmEmail from '../components/ConfirmEmail';

function ConfirmEmailPage(props) {
    console.log("called ConfirmEmailPage");

    return (
        <div className="flex h-full">
            <ConfirmEmail username={props.username} />
        </div>
    )
}

export default ConfirmEmailPage;
