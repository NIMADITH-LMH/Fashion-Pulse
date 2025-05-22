import { createContext } from 'react';

const AppContext = createContext({
    fetchUserDetails: () => {},
    cartProductCount: 0,
    fetchUserAddToCart: () => {},
    user: null,
    setUser: () => {}
});

export default AppContext; 