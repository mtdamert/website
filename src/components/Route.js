import { useEffect } from "react";
import useNavigation from '../hooks/use-navigation';

function Route({ path, children }) {
    useEffect(() => {
        document.title = 'mtdamert.com';
      }, []);

    const { currentPath } = useNavigation();

    if (path === currentPath) {
        return children;
    }

    return null;
}

export default Route;
