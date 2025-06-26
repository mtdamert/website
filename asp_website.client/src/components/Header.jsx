import { Outlet, Link } from "react-router-dom";

function renderLink(link) {
    return(
        <span key = {`${link.label}_span`} className = "px-2 " >
            <Link key={link.label} to={link.path} class="menu-link-item" >
                {link.label}
            </Link>
        </span >
    );
}

function Header(props) {
    const links = [
        {
            label: 'Games', path: null, adminOnly: false, verifiedOnly: false, children:
                [ { label: 'Tetris', path: '/tetris', adminOnly: false, verifiedOnly: false },
                  { label: 'Arkanoid', path: '/arkanoid', adminOnly: false, verifiedOnly: false }, ]
        },
        { label: 'Retirement Calculator', path: '/retirement-calc', adminOnly: false, verifiedOnly: false },
        { label: '3D Graphics', path: '/art', adminOnly: false, verifiedOnly: false },
        //{ label: 'Days Since App', path: 'days-since', adminOnly: false, verifiedOnly: false },
        { label: 'Mike\'s Tests', path: '/test', adminOnly: true, verifiedOnly: false },
        { label: 'Contact', path: '/contact-page', adminOnly: false, verifiedOnly: false },
        { label: 'Home', path: '/about', adminOnly: false, verifiedOnly: false },
    ];


    const renderedLinks = links.map((link, index) => {
        return ((!(link.adminOnly && !props.isAdmin)) && (!(link.verifiedOnly && !props.verifiedEmail))) // only render buttons that this user has permission for
            ? ((link.path != null) ? renderLink(link)
            : <span key={`${link.label}_span`} className="px-2 "><span key={link.label} to={link.path} // render a parent
                    class="menu-parent-item">{link.label}</span></span>)
            : <span key={`${link.label}_span`}></span>;
    });

    return (
        <div className="container mx-auto gap-2 mt-4 mb-6">
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
