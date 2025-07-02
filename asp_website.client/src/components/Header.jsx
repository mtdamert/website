import { Outlet, Link } from "react-router-dom";

function renderLink(link) {
    return (
        <span key={`${link.label}_span`} class="menu-link-item">
            <Link key={link.label} to={link.path}>
                {link.label}
            </Link>
        </span>
    );
}

function renderDropdownColumn(header) {
    // This justs displays the header text, but if you hover over it, it also shows its children

    return (
        <span class="menu-parent-item">
            <span key={`${header.label}_span`} class="menu-parent-item">
                {header.label}
            </span>
            <div class="menu-dropdown-wrapper">
                {header.children.map((childLink, index) => {
                    return (<div key={`${childLink.label}_span`} class="menu-child-item">
                        <Link key={childLink.label} to={childLink.path}>
                            {childLink.label}
                        </Link>
                    </div>);
                })}
            </div>
        </span>
    );
}

function Header(props) {
    const links = [
        {
            label: 'Games', path: null, adminOnly: false, verifiedOnly: false, children:
                [ { label: 'Tetris', path: '/tetris', adminOnly: false, verifiedOnly: false },
                  { label: 'Arkanoid', path: '/arkanoid', adminOnly: false, verifiedOnly: false }, ]
        },
        { label: 'Retirement Calculator', path: '/retirement-calc', adminOnly: false, verifiedOnly: false, },
        { label: '3D Graphics', path: '/art', adminOnly: false, verifiedOnly: false },
        //{ label: 'Days Since App', path: 'days-since', adminOnly: false, verifiedOnly: false },
        { label: 'Mike\'s Tests', path: '/test', adminOnly: true, verifiedOnly: false },
        { label: 'Contact', path: '/contact-page', adminOnly: false, verifiedOnly: false },
        { label: 'Home', path: '/about', adminOnly: false, verifiedOnly: false },
    ];


    const renderedLinks = links.map((link, index) => {
        return ((!(link.adminOnly && !props.isAdmin)) && (!(link.verifiedOnly && !props.verifiedEmail))) // only render buttons that this user has permission for
            ? ((link.path != null) ? renderLink(link) : renderDropdownColumn(link)) // render a link or a header and its child links
            : <span key={`${link.label}_span`}></span>; // render nothing
    });

    return (
        <div className="container gap-2 mt-4 mb-2">
            <div className="top-0 text-left ml-24">
                {renderedLinks}
            </div>
            <div>
                <Outlet />
            </div>
        </div>
    );
}

export default Header;
