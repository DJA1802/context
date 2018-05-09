import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Article,
  ArticleList,
  Home,
  Login,
  PageContainer,
  Signup,
  UserHome
} from './components';
import { me } from './store';

/**
 * COMPONENT
 */
class Routes extends Component {
  componentDidMount () {
    this.props.loadInitialData();
  }

  render () {
    const { isLoggedIn } = this.props;

    return (
      <Switch>
        {/* Routes placed here are available to all visitors */}
        {isLoggedIn ? (
          <Route exact path="/" component={Home} />
        ) : (
          <Route exact path="/" component={Login} />
        )}
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        {isLoggedIn && (
          <Switch>
            {/* Routes placed here are only available after logging in */}
            <Route
              path="/home"
              render={() => (
                <PageContainer>
                  <Home />
                </PageContainer>
              )}
            />
            <Route
              path="/user-home"
              render={() => (
                <PageContainer>
                  <UserHome />
                </PageContainer>
              )}
            />
            <Route
              exact
              path="/articles"
              render={() => (
                <PageContainer>
                  <ArticleList />
                </PageContainer>
              )}
            />
            <Route path="/articles/:id" component={Article} />
          </Switch>
        )}
        {/* Displays our Home component as a fallback */}
        <Route component={Login} />
      </Switch>
    );
  }
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    // Being 'logged in' for our purposes will be defined has having a state.user that has a truthy id.
    // Otherwise, state.user will be an empty object, and state.user.id will be falsey
    isLoggedIn: !!state.user.id
  };
};

const mapDispatch = dispatch => {
  return {
    loadInitialData () {
      dispatch(me());
    }
  };
};

// The `withRouter` wrapper makes sure that updates are not blocked
// when the url changes
export default withRouter(connect(mapState, mapDispatch)(Routes));

/**
 * PROP TYPES
 */
Routes.propTypes = {
  loadInitialData: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired
};
