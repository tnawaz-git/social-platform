import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

import Users from './user/pages/Users';
import NewPlace from './places/pages/NewPlace';
import Editor from './editor/pages/Editor';
import StripePayment from './user/pages/StripePayment';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './user/pages/Auth';
import VerificationForm from './places/pages/VerificationForm';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';



const App = () => {
  const { token, login, logout, userId } = useAuth();
  let Publishable_Key = 'pk_test_51JiJqoDZQxZRnwTZ3C3BLI7aH1POQng7ggRtxNXRMagxdHXUjbbgsNblb12E253SIQHkQWpqPfyrtrI0PECUf8j700b4qq2FKF';
  let Secret_Key = 'sk_test_51JiJqoDZQxZRnwTZ6CFKzag6JziWg6ZE72OeAwIubsA4P1og1TSU7Yh4Nrf56v7aPXRNDUb4gDK7UIunlVn11nGa0082T2p05Z';
 

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/users/paymentScreen/:userId/:Publishable_Key" exact>
          <StripePayment />
        </Route>
        <Route path="/users/verificationForm" exact>
          <VerificationForm />
        </Route>
        <Route path="/places/:placeId/:userId">
          <UpdatePlace />
        </Route>
        <Route path="/editor" exact>
          <Editor />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
