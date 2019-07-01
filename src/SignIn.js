
import './SignIn.css'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Modal from 'react-bootstrap/Modal'
import { withRouter } from 'react-router-dom'

class SignIn extends Component {
  constructor(props) {
    super(props)
    this.state = { showModal: false }
  }

  render() {
    if (this.props.userSession && (this.props.userSession.isUserSignedIn() || this.props.userSession.isSignInPending())) {
      return (<Redirect to={`/myfiles`} />)
    }
    return (
      <div>
        <section className="text-center">
          <div className="container">
            <div className="jumbotron signin-box row">
              <div className="col-sm-12 signin-logo"><a href="/"><img src="/logo.png" alt="Safe Notes"/></a></div>
              <div className="col-sm-12"><button type="button" className="upload-file-btn signin-btn" onClick={(e) => this.props.signIn(e)}>Continue with Blockstack</button></div>
              <div className="what-is-blockstack col-sm-12"><span onClick={(e) => this.setState({ showModal: true })}>What is Blockstack?</span></div>
              <Modal show={this.state.showModal} onHide={(e) => this.setState({ showModal: false })}>
                <Modal.Header closeButton>
                    <Modal.Title>What is Blockstack?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Blockstack is a new internet for decentralized apps that you access through the Blockstack Browser. With Blockstack, there is a new world of apps that let you own your data and maintain your privacy, security and freedom.</p>
                    <p>SafeNotes is built on top of Blockstack, allowing us to provide decentralized encrypted photo storage.</p>
                </Modal.Body>
              </Modal>
            </div>
          </div>
        </section>
      </div>
    )
  }
}
export default withRouter(SignIn)
