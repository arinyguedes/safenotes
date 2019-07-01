import './Dashboard.css'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import {
	PdfLoader,
	PdfHighlighter,
	Tip,
	Highlight,
	Popup,
	AreaHighlight
} from 'react-pdf-highlighter'
import FileManager from './fileManager'
import NotesNavigator from './NotesNavigator'
import { server_error, error, confirm } from './sweetalert'
import UploaderHandler from './UploaderHandler'
import { withRouter } from 'react-router-dom'

const resetHash = () => { window.location.hash = "" }

const HighlightPopup = ({ comment }) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null

const getNextId = () => String(Math.random()).slice(2)
  
const parseIdFromHash = () => window.location.hash.slice("#highlight-".length)
  
class Dashboard extends Component {
	constructor(props){
		super(props)
		this.state = {
			dragging: false,
			executing: false,
			mounted: false,
			files: [],
			firstPages: {},
			selectedFile: null,
			url: null,
			highlights: []
		}
	}

	scrollViewerTo = (highlight) => {}

	scrollToHighlightFromHash = () => {
	  const highlight = this.getHighlightById(parseIdFromHash())
	  if (highlight) {
		this.scrollViewerTo(highlight)
	  }
	}

	componentDidMount() {
		window.addEventListener(
			"hashchange",
			this.scrollToHighlightFromHash,
			false
		);
	}

	getHighlightById(id) {
		const { highlights } = this.state
		return highlights.find(highlight => highlight.id === id)
	}

	addHighlight(highlight) {
		const { highlights } = this.state
		this.setState({ highlights: [{ ...highlight, id: getNextId() }, ...highlights] }, () => this.updateFilesAfterSaveHighlights()
		);
	}

	updateHighlight(highlightId, position, content) {	
		this.setState({
		  highlights: this.state.highlights.map(h => {
			return h.id === highlightId
			  ? {
				  ...h,
				  position: { ...h.position, ...position },
				  content: { ...h.content, ...content }
				}
			  : h;
		  })
		},() => this.updateFilesAfterSaveHighlights());
	}

	removeHighlight(highlight) {
		this.setState({
		  highlights: this.state.highlights.filter(h => {
			return h.id !== highlight.id;
		  })
		},() => this.updateFilesAfterSaveHighlights());
	}

	updateFilesAfterSaveHighlights(){
		var files = this.state.files;
		var selectedFile = this.state.selectedFile;
		for (var i = 0; i < files.length; ++i) {
			if (files[i].storageName === selectedFile.storageName) {
				files[i].highlightsLastModified = (new Date()).getTime()
				files[i].highlightsCount = this.state.highlights.length
				selectedFile = files[i]
				this.setState({files: this.sortFiles(files), selectedFile: selectedFile})
				break
			}
		}
		FileManager.saveHighlights(selectedFile, this.state.highlights)
	}
 
	setNewFile(fileData) {
		this.props.setfileSaved()
		var files = this.state.files
		files.unshift(fileData.metadata)
		var firstPages = this.state.firstPages
		firstPages[fileData.metadata.storageName] = fileData.firstPage
		this.setState({ firstPages: firstPages, selectedFile: fileData.metadata, url: fileData.content, highlights: fileData.highlights, files: files })
	}

	goBack() {
		this.setState({ selectedFile: null, url: null, highlights: [] })
	}

	loadFile(metadata) {
		if (!this.state.executing) {
			var state = {}
			state["executing"] = true
			state[metadata.storageName] = 'load'
			this.setState(state, () =>
			{
				this.props.setLoading('Loading ' + metadata.name)
				FileManager.get(metadata.storageName, metadata.type).then((fileData) =>
				{
					var state = {}
					state["executing"] = false
					state[metadata.storageName] = undefined
					state["selectedFile"] = metadata
					state["url"] = fileData.content
					state["highlights"] = fileData.highlights
					this.setState(state)
					this.props.setLoading(null)
				}).catch((err) => 
				{
					var state = {}
					state["executing"] = false
					state[metadata.storageName] = undefined
					this.setState(state)
					this.props.setLoading(null)
					server_error(err)
				})
			})
		} else {
			error("Please, wait for the previous execution...", "")
		}
	}

	deleteFile(metadata) {
		if (!this.state.executing) {
			confirm("Are you sure that you want to delete the file "+metadata.name+" ?", (toDelete) => this.onModalToDeleteSelect(metadata, toDelete), true, null, 'Delete')
		} else {
			error("Please, wait for the previous execution...", "")
		}
	}

	onModalToDeleteSelect(metadata, toDelete) {
		if (toDelete) {
			var state = {}
			state["executing"] = true
			state[metadata.storageName] = 'delete'
			this.setState(state, () =>
			{
				this.props.setLoading('Deleting...')
				FileManager.delete(metadata.storageName).then(() =>
				{
					var files = this.state.files
					for ( var i = 0; i < files.length; i++) { 
						if (files[i].storageName === metadata.storageName) {
							files.splice(i, 1)
							break
						}
					}
					var state = {}
					state["executing"] = false
					state[metadata.storageName] = undefined
					state["files"] = files
					this.setState(state)
					this.props.setLoading(null)
				}).catch((err) => 
				{
					var state = {}
					state["executing"] = false
					state[metadata.storageName] = undefined
					this.setState(state)
					this.props.setLoading(null)
					server_error(err)
				})
			})
		}
	}

	sortFiles(files) {
		return files.sort((a, b) => (a.highlightsLastModified > b.highlightsLastModified) ? -1 : ((b.highlightsLastModified > a.highlightsLastModified) ? 1 : 0))
	}

	loadFirstPages() {
		var files = this.state.files
		var promises = []
		for (var i = 0; i < files.length; ++i) {
			promises.push(FileManager.getFirstPage(files[i].storageName))
		}
		var firstPages = {}
		Promise.all(promises).then((result) =>
		{
			for (var i = 0; i < result.length; ++i) {
				firstPages[files[i].storageName] = result[i]
			}
			this.setState({firstPages: firstPages})
		}).catch((err) => server_error(err))
	}

	handleDragOver(e) {
		e.stopPropagation()
		e.preventDefault()
		return false
	}
	
	handleDragEnter() {
		this.setState({dragging: true})
	}
	
	handleDragLeave() {
		this.setState({dragging: false})
	}
	
	handleDrop(e) {
		e.stopPropagation()
		e.preventDefault()
		this.setState({dragging: false, fileDragged: e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0]})
	}

	componentWillMount() {
		if (this.props.userSession && this.props.userSession.isUserSignedIn()) {
			FileManager.list().then((files) =>
			{
				this.setState({files: this.sortFiles(files), mounted: true}, () => 
				{
					if (window.location.search.indexOf("l=true") >= 0) {
						this.props.history.push('/myfiles');
						this.loadFile(this.state.files[0])
					}
					this.loadFirstPages()
				})
			}).catch((err) => server_error(err))
		}
	}

	render() {
		if (!this.props.userSession || !this.props.userSession.isUserSignedIn()) {
			return (<Redirect to={`/signin`} />)
		}
		if (this.props.uploading && this.state.url) {
			this.goBack()
		}
		else if (this.props.fileSaved) {
			this.setNewFile(this.props.fileSaved)
		}
		const {url, files, mounted, highlights, executing, selectedFile } = this.state
		return (<div>
			{!url ? 
			<div className={this.state.dragging ? "dragging-file" : ""}
				onDragOver={e => this.handleDragOver(e)}
				onDragEnter={e => this.handleDragEnter(e)}
				onDragLeave={e => this.handleDragLeave(e)}
				onDrop={e => this.handleDrop(e)}>

				<UploaderHandler
					clearInput={() => this.setState({fileDragged: null})}
					setFile={(result) => this.setNewFile(result)}
					fileDragged={this.state.fileDragged}
					setActionRealized={() => this.setState({fileDragged: null})}
					setUploading={(status) => {this.props.setLoading(status ? 'Uploading...' : null)}}
				>
				</UploaderHandler>
				<section className="dashboard">
          			<div className="container">
						<div className="row">
              				<div className="col-12">
                				<div className="section-title my-4">MY FILES</div>
							</div>
							{files.length === 0 ? mounted ? <div className="no-files">
								<i className="fa fa-folder-open"></i>
								<span>Drop your PDF file here to upload.</span>
								</div> : <div className="no-files">Loading...</div>
							:
							files.map((file) => (
								<div key={file.storageName} className="col-md-3 col-lg-2 col-sm-4 mb-4">
									<div className="file-lastmodified">{(new Date(file.highlightsLastModified)).toLocaleString()}</div>
									<div onClick={(e) => this.loadFile(file)} className="document-preview" style={{backgroundImage: 'url('+this.state.firstPages[file.storageName]+')'}}>
										<div className="document-preview-opacity">
											<i className="fa fa-eye"></i>
										</div>
										<div className="highlights-count" title={file.highlightsCount + ' safe notes'}><i className="fa fa-paperclip"></i>{file.highlightsCount}</div>
									</div>
									<div className="file-name" title={file.name}>{file.name}</div>
									<div>
										<span className="delete-link" onClick={(e) => this.deleteFile(file)} disabled={!!executing}>Delete</span>
									</div>
									
									{/* <div>{file.storageName}</div>
									<div>{(new Date(file.highlightsLastModified)).toLocaleString()}</div>
									<div>{file.highlightsCount}</div>
									
									<div>{(new Date(file.createAt)).toLocaleString()}</div>
									<div>{file.type}</div>
									<div>{file.size}</div> */}
								</div>
							))}
						</div>
					</div>
				</section>
			</div> 
			:
			<div>
				<div className="navigator-and-document-wrapper">
					<NotesNavigator goBack={() => this.goBack()} highlights={highlights} title={selectedFile.name} onDeleteHighlightClick={highlight => this.removeHighlight(highlight)}></NotesNavigator>
					<div className="pdf-loader-wrapper">
						<PdfLoader url={url} beforeLoad={<div>Loading</div>}>
							{pdfDocument => (
								!pdfDocument ? null :
								<PdfHighlighter
									pdfDocument={pdfDocument}
									enableAreaSelection={event => event.altKey}
									onScrollChange={resetHash}
									scrollRef={scrollTo => {
										this.scrollViewerTo = scrollTo;

										this.scrollToHighlightFromHash();
									}}
									onSelectionFinished={(
										position,
										content,
										hideTipAndSelection,
										transformSelection
									) => (
											<Tip
												onOpen={transformSelection}
												onConfirm={comment => {
													this.addHighlight({ content, position, comment });

													hideTipAndSelection();
												}}
											/>
										)}
									highlightTransform={(
										highlight,
										index,
										setTip,
										hideTip,
										viewportToScaled,
										screenshot,
										isScrolledTo
									) => {
										const isTextHighlight = !Boolean(
											highlight.content && highlight.content.image
										);

										const component = isTextHighlight ? (
											<Highlight
												isScrolledTo={isScrolledTo}
												position={highlight.position}
												comment={highlight.comment}
											/>
										) : (
												<AreaHighlight
													highlight={highlight}
													onChange={boundingRect => {
														console.log(boundingRect)
														this.updateHighlight(
															highlight.id,
															{ boundingRect: viewportToScaled(boundingRect) },
															{ image: screenshot(boundingRect) }
														);
													}}
												/>
											);

										return (
											<Popup
												popupContent={<HighlightPopup {...highlight} />}
												onMouseOver={popupContent =>
													setTip(highlight, highlight => popupContent)
												}
												onMouseOut={hideTip}
												key={index}
												children={component}
											/>
										);
									}}
									highlights={highlights}
								/>
							)}
						</PdfLoader>
					</div>
				</div>
			</div>}
		</div>)
	}
}
export default withRouter(Dashboard)
