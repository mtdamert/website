import Link from './Link';

function Sidebar() {
    const links = [
        { label: 'Click here to see Test', path: '/test' },
        { label: 'AnotherTest', path: '/another-test' },
        { label: 'Tetris', path: '/tetris' },
        { label: 'Graphs', path: '/graphs' },
        { label: '3D', path: '/3d_art' },
        { label: 'Days Since App', path: 'days_since' },
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
        <div className="top-0">
            {renderedLinks}
        </div>
    );
}

export default Sidebar;
