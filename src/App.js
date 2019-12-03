import './App.css'
import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { UserSession, isExpirationDateValid } from 'blockstack'
import Landing from './Landing'
import Dashboard from './Dashboard'
import SignIn from './SignIn'
import NavBar from './NavBar'
import { appConfig } from './constants'
import { withRouter } from 'react-router-dom'

class App extends Component {
  constructor() {
    super()
    this.userSession = new UserSession({ appConfig })
    this.state = {
      fileSaved: null
    }
  }

  componentWillMount() {
    const session = this.userSession
    if(!session.isUserSignedIn() && session.isSignInPending()) {
      session.handlePendingSignIn()
      .then((userData) => {
        if(!userData.username) {
          throw new Error('This app requires a username.')
        }
        this.props.history.push('/myfiles')
      })
    } else if (session.isUserSignedIn() && !isExpirationDateValid(session.loadUserData().authResponseToken)) {
      this.signOut()
    }
  }

  signIn(e) {
    e.preventDefault()
    var origin = window.location.origin
    this.userSession.redirectToSignIn(origin + '/myfiles', origin + '/manifest.json', ['store_write'])
  }

  signOut(e) {
    if (e) {
      e.preventDefault()
    }
    this.userSession.signUserOut(window.location.origin)
  }

  setFileResult(result) {
    if (window.location.pathname.startsWith("/myfiles")) {
      this.setState({fileSaved: result, uploading: false})
    } else {
      this.props.history.push('/myfiles?l=true')
    }
  }

  render() {
    return (
      <main role="main">
        {!!this.state.loading && 
          <div className="loading-overlay">   
            <div className="loading-container">
              <i className="fa fa-refresh fa-spin"></i>
              <span>&nbsp;&nbsp;{this.state.loading}</span>
            </div>
          </div>}
        <NavBar 
          userSession={this.userSession} 
          signOut={this.signOut} 
          setFile={(result) => this.setFileResult(result)}
          setUploading={(uploading) => this.setState({uploading: uploading})}
          setLoading={(loading) => this.setState({loading: loading})}
        />
        <Switch>
          <Route
            path={`/signin`}
            render={ routeProps => <SignIn {...routeProps}
              userSession={this.userSession} 
              signIn={this.signIn}/> }
          />
          <Route
            path={`/myfiles`}
            render={ routeProps => <Dashboard {...routeProps} 
              userSession={this.userSession} 
              fileSaved={this.state.fileSaved}
              uploading={this.state.uploading}
              setfileSaved={() => this.setState({fileSaved: null})}
              setLoading={(loading) => this.setState({loading: loading})} /> }
          />
          <Route 
            path={`/`} 
            render={ routeProps => <Landing {...routeProps} 
              userSession={this.userSession} /> }
          />
        </Switch>
      </main>
    );
  }
}
export default withRouter(App)
