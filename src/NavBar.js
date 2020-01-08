import './NavBar.css'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { lookupProfile, Person } from 'blockstack'
import UploaderHandler from './UploaderHandler'
import { withRouter } from 'react-router-dom'

class NavBar extends Component {
  constructor(props){
    super(props)
		this.state = {
      person: null,
      selectFile: false
    }
  }
  
  componentDidMount() {
    if (this.props.userSession && this.props.userSession.isUserSignedIn()) {
      var username = this.props.userSession.loadUserData().username
      lookupProfile(username).then((profile) => 
      {
          if (profile) {
              var person = new Person(profile);
              var name = person.name();
              var avatarUrl = person.avatarUrl();
              if (avatarUrl) {
                  fetch(avatarUrl).then((response) =>
                  {
                      response.arrayBuffer().then((buffer) =>
                      {
                        this.setState({ person: { username: username, name: name, avatarUrl: URL.createObjectURL(new Blob([new Uint8Array(buffer)], {type: "image"})) }})
                      })
                      .catch((err) =>
                      {
                          console.error(err)
                          this.setState({ person: { username: username, name: name, avatarUrl: null }})
                      })
                  })
                  .catch((err) =>
                  {
                      console.error(err)
                      this.setState({ person: { username: username, name: name, avatarUrl: null }})
                  })
              } else {
                this.setState({ person: { username: username, name: name, avatarUrl: null }})
              }
          }
      })
    }
  }

  handleSelectClick(e) {
    e.preventDefault()
    if (!this.props.userSession || !this.props.userSession.isUserSignedIn()) {
      this.props.history.push('/signin')
    } else {
      this.setState({ selectFile: true })
    }
  }

  render() {
    if (window.location.pathname.startsWith('/signin')) {
      return (<div></div>)
    }
    var username = null
    var userImage = null
    if (this.props.userSession && this.props.userSession.isUserSignedIn()) {
      username = this.state.person && this.state.person.name ? this.state.person.name : this.props.userSession.loadUserData().username
      userImage = this.state.person && this.state.person.avatarUrl ? this.state.person.avatarUrl : null
    }
    return (
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
        <div className="container">
          <UploaderHandler
            clearInput={() => this.setState({ selectFile: false })}
            setFile={(result) => this.props.setFile(result)}
            clicked={this.state.selectFile}
            setActionRealized={() => this.setState({ selectFile: false })}
            setUploading={(status) => {
              this.props.setUploading(status) 
              this.props.setLoading(status ? 'Uploading...' : null)
            }}
          ></UploaderHandler>
          <Link className="navbar-brand d-flex align-items-center clickable" to={`/`}>
            <img src="/logo.png" alt="Safe Notes" />
          </Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav mr-auto ml-lg-2">
              {username && 
                <li className={window.location.pathname.startsWith("/myfiles") ? "nav-item mx-lg-2 active" : "nav-item mx-lg-2"}>
                  <Link className="nav-link link-nav clickable" to={`/myfiles`}>MY FILES</Link>
                </li>
              }
            </ul>
            <ul className="navbar-nav">
              {username && 
                <li className="nav-item">         
                  <Link className="nav-link user-nav clickable" to={`/myfiles`}>   
                    <div className="user-nav-wrap">
                      { userImage ? <img src={userImage} className="user-img-nav" alt={username} /> : <i className="fa fa-user-circle mr-1"></i> }
                      <span>{username}</span>
                    </div>
                  </Link>
                </li>
              }
              <button type="button" className="upload-file-btn btn-nav my-2" onClick={(e) => this.handleSelectClick(e)} disabled={this.state.savingFile || this.state.selectFile}>UPLOAD PDF</button>
              <div className="nav-separator mx-lg-1"></div>

              {username &&
                <li className="nav-item mx-lg-2">
                  <div className="nav-link link-nav underline clickable" onClick={(e) => this.props.signOut(e)}>SIGN OUT</div>
                </li>
              }
              {!username && 
                <li className="nav-item mx-lg-2">
                  <Link className="nav-link link-nav underline clickable" to='/signin'>SIGN UP</Link>
                </li>
              }
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link twitter-nav clickable" rel="noopener noreferrer" href="https://twitter.com/notes_safe" target="_blank"><i className="fa fa-twitter" alt="Follow on Twitter"></i></a>
              </li>
            </ul>
          </div>
        </div>
      </nav>)   
  }
}
export default withRouter(NavBar)
