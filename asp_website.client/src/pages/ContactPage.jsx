import Contact from '../components/Contact';

function ContactPage(props) {
    return (
        <div className="flex">
            <Contact username={props.username} emailAddress={props.emailAddress} />
        </div>
    )
}

export default ContactPage;
