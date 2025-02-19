import { Outlet, Link } from "react-router-dom";

function Header(props) {
    const links = [
        { label: 'Tetris', path: '/tetris', adminOnly: false },
        { label: 'Arkanoid', path: '/arkanoid', adminOnly: false },
        { label: 'Retirement Calculator', path: '/retirement-calc', adminOnly: false },
        { label: 'Art', path: '/art', adminOnly: false },
        { label: 'Days Since App', path: 'days-since', adminOnly: false },
        { label: 'Mike\'s Tests', path: '/test', adminOnly: true },
        { label: 'About', path: '/about', adminOnly: false },
    ];

    const renderedLinks = links.map((link, index) => {
        return (!(link.adminOnly && !props.isAdmin)) ? <span key={`${link.label} span`} className="px-2 "><Link
            key={link.label}
            to={link.path}
            className="mb-3 font-bold h-full text-blue-500"
        >{link.label}</Link></span> : <></>;
    });

    return (
        <div className="container mx-auto gap-2 mt-2 mb-8">
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
