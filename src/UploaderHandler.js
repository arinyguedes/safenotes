import './UploaderHandler.css'
import React, { Component } from 'react'
import { error, server_error } from './sweetalert'
import FileManager from './fileManager'

class UploaderHandler extends Component {
    constructor(props) {
        super(props)
        this.state = {
            uploading: false,
            fileToUpload: null,
            fileLastModified: null,
            fileType: null,
            fileSize: null,
            fileName: null
        }
    }

    clearComponent() {
        this.setState({
            uploading: false,
            fileToUpload: null,
            fileLastModified: null,
            fileType: null,
            fileSize: null,
            fileName: null
        })
        this.props.setUploading(false)
        this.props.clearInput()
    } 

    handleReaderLoaded(e) {
        var file = e && e.target ? e.target.result : null
        if (file) {
            this.setState({uploading: true}, () =>
            {
                FileManager.create(this.state.fileName, this.state.fileSize, this.state.fileType, this.state.fileLastModified, file).then((result) =>
                {
                    this.clearComponent()
                    this.props.setFile(result)
                }).catch((err) => 
                {
                    this.setState({uploading: false})
                    this.props.setUploading(false)
                    server_error(err)
                })
            })
        } else {
            error("Invalid file.")
            this.clearComponent()
        }
    }

    handleFileSelect(file) {
        if (!this.state.uploading) {
            if (file) {
                this.props.setUploading(true)
                if (file.type === "application/pdf") {
                    if (file.size < 25000000) {
                        this.setState({fileSize: file.size, fileName: file.name, fileType: file.type, fileLastModified: file.lastModified})
                        var reader = new FileReader()
                        reader.onload = this.handleReaderLoaded.bind(this)
                        reader.readAsArrayBuffer(file)
                    } else {
                        error("For a while, the maximum file size allowed is 25MB.")
                        this.clearComponent()
                    }
                } else {
                    error("Invalid file type.")
                    this.clearComponent()
                }
            } else {
                this.clearComponent()
            }
        } else {
            error("Please, wait for the previous execution...", "")
        }
    }

    handleFileChange(e) {
        this.handleFileSelect(e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0])
    }

    handleClick() {
        if (!this.state.uploading) {
            document.getElementById("pdfFileInput").click()
        } else {
            error("Please, wait for the previous execution...", "")
        }
    }

    render() {
        if (this.props.clicked) {
            setTimeout(() => 
            {
                this.props.setActionRealized()
                this.handleClick()
            }, 0);
        }
        if (this.props.fileDragged) {
            setTimeout(() => 
            {
                var file = this.props.fileDragged
                this.props.setActionRealized()
                this.handleFileSelect(file)
            }, 0);
        }
        return (<input className="pdfFileInput" type="file" id="pdfFileInput" name="pdfFileInput" accept=".pdf" onChange={e => this.handleFileChange(e)} disabled={this.state.uploading} />)
    }
}
export default UploaderHandler