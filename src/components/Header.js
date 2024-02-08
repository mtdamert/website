//import Link from './Link';
import { Outlet, Link } from "react-router-dom";

function Header() {
    const links = [
        { label: 'Click here to see Test', path: '/test' },
        { label: 'Another Test', path: '/another-test' },
        { label: 'Tetris', path: '/tetris' },
        { label: 'Graphs', path: '/graphs' },
        { label: 'Retirement Calculator', path: '/retirement-calc' },
        {/* label: '3D', path: '/3d_art' },
        { label: 'Days Since App', path: 'days_since'*/},
    { label: 'About Me', path: '/about' },
    ];

    const renderedLinks = links.map((link) => {
        return <span><Link
            key={link.label}
            to={link.path}
            className="mb-3"
            activeClassName="font-bold h-full"
        >{link.label}</Link> | </span>
    })

    return (
        <div className="container mx-auto gap-2 mt-4">
            <div className="top-0 text-center">
                {renderedLinks}
            </div>
            <div>
                <Outlet />
            </div>
        </div>
    );
}

export default Header;
