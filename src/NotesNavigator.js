import React, { Component } from 'react'
import './NotesNavigator.css'
import { confirm } from './sweetalert'

const updateHash = highlight => {
  window.location.hash = `highlight-${highlight.id}`;
};

class NotesNavigator extends Component {
	render(){
		const {highlights, goBack} = this.props;
		return (
			<div className="sidebar" style={{ width: "25vw" }}>
				<div className="description" style={{ padding: "1rem" }}>
					<div style={{ fontSize: "0.7rem", marginBottom: "1rem" }}>
					<div className="clickable back" onClick={(e) => goBack()}>
						<i className="fa fa-arrow-left"></i>
						<span>BACK</span>
					</div>
					</div>
					<span title={this.props.title}>{this.props.title}</span>	
					<p>
					<small>
						To create area highlight hold Alt, then click and
						drag.
					</small>
					</p>
				</div>
				<div className="highlights">
					<ul className="sidebar__highlights">
						{highlights.map((highlight, index) => (
						<li
							key={index}
							className="sidebar__highlight"
							onClick={() => {
							updateHash(highlight);
							}}
						>
							<i className="fa fa-close" onClick={() => this.onDeleteHighlightClick(highlight)}></i>
							<div>
							<strong>{highlight.comment.text}</strong>
							{highlight.content.text ? (
								<blockquote style={{ marginTop: "0.5rem" }}>
								{`${highlight.content.text.slice(0, 90).trim()}…`}
								</blockquote>
							) : null}
							{highlight.content.image ? (
								<div
								className="highlight__image"
								style={{ marginTop: "0.5rem" }}
								>
								<img src={highlight.content.image} alt={"Screenshot"} />
								</div>
							) : null}
							</div>
							<div className="highlight__location">
							Page {highlight.position.pageNumber}
							</div>
						</li>
						))}
					</ul>
				</div>
			</div>
		);
	}


	onDeleteHighlightClick(highlight) {
        confirm("Are you sure that you want to delete this note?", (toDelete) => this.onModalToDeleteSelect(toDelete, highlight), false, null, 'Delete'); 
	}
	
	onModalToDeleteSelect(toDelete, highlight) {
        if (toDelete) {
            this.props.onDeleteHighlightClick(highlight);
        }
    }
}

export default NotesNavigator