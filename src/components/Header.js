import Link from './Link';

function Header() {
    const links = [
        { label: 'Click here to see Test', path: '/test' },
        { label: 'Another Test', path: '/another-test' },
        { label: 'Tetris', path: '/tetris' },
        {/*{ label: 'Graphs', path: '/graphs' },
        { label: '3D', path: '/3d_art' },
        { label: 'Days Since App', path: 'days_since' },*/},
    { label: 'About Me', path: '/about' },
    ];

    const renderedLinks = links.map((link) => {
        return <Link
            key={link.label}
            to={link.path}
            className="mb-3"
            activeClassName="font-bold h-full"
        >{link.label}</Link>
    })

    return (
        <div className="top-0 text-center">
            {renderedLinks}
        </div>
    );
}

export default Header;
