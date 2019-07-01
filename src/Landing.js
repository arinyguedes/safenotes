import './Landing.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

class Landing extends Component {
  componentWillMount() {
    if (window.location.pathname !== '/') {
      this.props.history.push('/')
    }
  }

  onGetStartedClick(){
    if (!this.props.userSession || !this.props.userSession.isUserSignedIn()) {
			this.props.history.push('/signin')
    }
    else{
      this.props.history.push('/myfiles')
    }
  }

  render() {
    return (
      <div className="Landing">
        <section className="header">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="section-title mt-5">SafeNotes</div>
                <div className="head-text">Secure PDF Annotator</div>
                <div className="description-text mt-4">Securely annotate and store your PDF documents -  100% Private &amp; Encrypted</div>
                <button className="upload-file-btn my-5" onClick={() => this.onGetStartedClick()}>GET STARTED</button>
              </div>
              <div className="col-lg-6 d-none d-lg-block py-2 home-img">
                <img src="./Img_Home.png"></img>
              </div>
            </div>
            <div className="row py-5">
              <div className="col-12">
                <div className="section-title features-title">FEATURES</div>
              </div>
            </div>
          </div>
        </section>
        <section className="features">
          <div className="container">
            <div className="row">
              <div className="col-lg-4 feature-item">
                <div className="feature-icon">
                  <img src="./Icons/Icon_Take-notes.png"></img>
                </div>
                <div className="feature-title">Take notes and add highlights</div>
                <div className="feature-description">Easily annotate documents directly while reading them with real-time synchronization.</div>
              </div>
              <div className="col-lg-4 feature-item">
                <div className="feature-icon">
                  <img src="./Icons/Icon_Unlimited.png"></img>
                </div>
                <div className="feature-title">Unlimited PDF uploads</div>
                <div className="feature-description">Use the default Blockstack storage for free with unlimited PDF uploads.</div>
              </div>
              <div className="col-lg-4 feature-item">
                <div className="feature-icon">
                  <img src="./Icons/Icon_Simple.png"></img>
                </div>
                <div className="feature-title">Simple &amp; easy to use</div>
                <div className="feature-description">It’s intuitive, easy to use, just upload your PDFs &amp; start taking notes.</div>
              </div>
              <div className="col-lg-4 feature-item">
                <div className="feature-icon">
                  <img src="./Icons/Icon_Free.png"></img>
                </div>
                <div className="feature-title">Free and Open Source</div>
                <div className="feature-description">You can also run SafeNotes locally on your computer, clone it from <a href="https://github.com/arinyguedes/safenotes" target="_blank">Github</a>.</div>
              </div>
              <div className="col-lg-4 feature-item">
                <div className="feature-icon">
                  <img src="./Icons/Icon_Secure.png"></img>
                </div>
                <div className="feature-title">Secure &amp; Encrypted</div>
                <div className="feature-description">No one but you has access to your PDF and annotations. All your PDF files &amp; annotations are stored encrypted with keys only you control.</div>
              </div>
              <div className="col-lg-4 feature-item">
                <div className="feature-icon">
                  <img src="./Icons/Icon_Never.png"></img>
                </div>
                <div className="feature-title">Never Lose your Documents</div>
                <div className="feature-description">All documents and notes are permanently stored in your own private data storage.</div>
              </div>
            </div>
          </div>
        </section>
        <section className="footer">
          <div className="container">
            <hr></hr>
            <div className="footer-text text-center mb-4">Safe Notes  •  2019</div>
        </div>
        </section>
      </div>
    )
  }
}
export default withRouter(Landing)
