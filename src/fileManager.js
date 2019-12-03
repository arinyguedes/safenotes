import {  
    listFiles,
    getFile,
    putFile,
    deleteFile
} from 'blockstack'
import { pdfjs } from 'react-pdf'
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`

const metadataFilePrefix = "metadata__"
const filePrefix = "file__"
const highlightsFilePrefix = "highlights__"
const firstPageFilePrefix = "firstpage__"

export default class FileManager {
    static create (name, size, type, lastModified, arrayBuffer) {
        return new Promise(function (resolve, reject) {
            var simpleName = name
            name = FileManager._getFileName(name)
            var metadataFileName = metadataFilePrefix + name
            var fileName = filePrefix + name
            var firstPageFileName = firstPageFilePrefix + name
            var content = FileManager._getFileUrl(arrayBuffer, type)
            pdfjs.disableWorker = true
            pdfjs.getDocument(content).then((pdf) =>
            {
                pdf.getPage(1).then((page) =>
                {
                    var viewport = page.getViewport(0.6)
                    var canvas = document.createElement('canvas')
                    var context = canvas.getContext('2d')
                    canvas.height = viewport.height
                    canvas.width = viewport.width
                    page.render({canvasContext: context, viewport: viewport}).then(() =>
                    {
                        var firstPage = canvas.toDataURL('image/jpeg')
                        var now = (new Date()).getTime()
                        var metadata = {
                            name: simpleName,
                            size: size,
                            type: type,
                            storageName: name,
                            fileLastModified: lastModified,
                            createAt: now,
                            highlightsLastModified: now,
                            highlightsCount: 0
                        }
                        var dataToSave = []
                        dataToSave.push([metadataFileName, JSON.stringify(metadata)])
                        dataToSave.push([fileName, arrayBuffer])
                        dataToSave.push([firstPageFileName, firstPage])
                        FileManager._saveMultipleFiles(dataToSave).then(() =>
                        {
                            resolve({ metadata: metadata, firstPage: firstPage, content: content, highlights: [] })
                        }).catch((err) => reject(err))
                    }).catch((err) => reject(err))
                }).catch((err) => reject(err))
            }).catch((err) => reject(err))
        })
    }

    static delete (name) { 
        return new Promise(function (resolve, reject) {
            FileManager._deleteFile(metadataFilePrefix + name).then(() =>
            {
                setTimeout(() => FileManager._deleteFile(filePrefix + name), 1000)
                setTimeout(() => FileManager._deleteFile(firstPageFilePrefix + name), 1000)
                setTimeout(() => FileManager._deleteFile(highlightsFilePrefix + name), 1000)
                resolve()
            }).catch((err) => reject(err))
        })
    }

    static saveHighlights (metadata, highlights) {
        return new Promise(function (resolve, reject) {
            putFile(metadataFilePrefix + metadata.storageName, JSON.stringify(metadata)).then(() =>
            {
                putFile(highlightsFilePrefix + metadata.storageName, JSON.stringify(highlights)).then(() =>
                {
                    resolve()
                }).catch((err) => reject(err))
            }).catch((err) => reject(err))
        })
    }

    static list () {
        return new Promise(function (resolve, reject) {
            var files = []
            listFiles((fileName) =>
            {
                if (fileName.startsWith(metadataFilePrefix)) {
                    files.push(getFile(fileName))
                }
                return true
            }).then(() => 
            {
                if (files.length === 0) {
                    resolve([])
                } else {
                    Promise.all(files).then((result) =>
                    {
                        var metadatas = []
                        for (var i = 0; i < result.length; ++i) {
                            metadatas.push(JSON.parse(result[i]))
                        }
                        resolve(metadatas)
                    }).catch((err) => reject(err))
                }
            }).catch((err) => reject(err))
        })
    }

    static getFirstPage (name) {
        return new Promise(function (resolve, rejetc) {
            getFile(firstPageFilePrefix + name).then((file) =>
            {
                resolve(file)
            }).catch((err) => rejetc(err))  
        })
    }

    static get (name, type) {
        return new Promise(function (resolve, rejetc) {
            getFile(filePrefix + name).then((file) =>
            {
                var result = { content: FileManager._getFileUrl(file, type) }
                getFile(highlightsFilePrefix + name).then((highlights) =>
                {
                    result["highlights"] = (highlights ? JSON.parse(highlights) : [])
                    resolve(result)
                }).catch((err) => rejetc(err))  
            }).catch((err) => rejetc(err))  
        })
    }

    static _getFileName (name) {
        var splitName = name.split('.')
        var nameWithoutType = ""
        var nameType = ""
        if (splitName.length === 1) {
            nameWithoutType = name
        } else {
            nameType = splitName[splitName.length-1]
            for (var i = 0; i < splitName.length - 1; ++i) {
                if (i > 0) nameWithoutType += "."
                nameWithoutType += splitName[i]
            }
        }
        nameWithoutType = nameWithoutType + "_" + (new Date()).getTime()
        if (nameType) {
            return nameWithoutType + "." + nameType
        } else {
            return nameWithoutType
        }
    }

    static _getFileUrl (arrayBuffer, type) {
        return URL.createObjectURL(new Blob([new Uint8Array(arrayBuffer)],{type: type}))
    }

    static _deleteFile (fileName) {
        return new Promise(function (resolve, reject) {
            deleteFile(fileName).then(() => 
            {
                resolve()
            }).catch((err) => reject(err))
        })
    }

    static _saveMultipleFiles (data) {
        return new Promise(function (resolve, reject) {
            var promises = []
            for (var i = 0; i < data.length; ++i) {
                promises.push(putFile(data[i][0], data[i][1]))
            }
            Promise.all(promises).then(() => resolve()).catch((err) => 
            {
                for (var i = 0; i < data.length; ++i) {
                    var fileName = data[i][0]
                    setTimeout(() => FileManager._deleteFile(fileName), 1000)
                }
                reject(err)
            })
        })
    }
}
