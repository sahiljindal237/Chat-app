import React from 'react';
import 'rsuite/dist/styles/rsuite-default.css';
import './styles/main.scss';
import { Switch } from 'react-router';
import SignIn from './pages/SignIn';
import Home from './pages/home/Home';
import PublicRoute from './components/PublicRoute';
import PrivateRoute from './components/PrivateRoute';
import { ProfileProvider } from './context/Profile.context';

function App() {
  return (
    <ProfileProvider>
      <Switch>
        <PublicRoute path="/signin">
          <SignIn />
        </PublicRoute>
        <PrivateRoute path="/">
          <Home />
        </PrivateRoute>
      </Switch>
    </ProfileProvider>
  );
}

export default App;
