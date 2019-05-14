import React, { Component } from 'react'
import PropTypes from 'prop-types'
import uuid from 'uuid'
import { File } from 'react-feather'
import { sanitize } from 'utils'
import {styles} from './styles.module.scss'

const VALID_FILE_TYPES = ['png', 'jpg', 'jpeg', 'gif', 'zip', 'rar', 'gzip', 'pdf', 'txt', 'json', 'doc', 'docx', 'csv', 'js', 'html', 'css']

export default class FileTransfer extends Component {
  constructor() {
    super()
    this.state = {
      supported: true,
      localFileQueue: [],
    }
  }

  componentWillMount() {
    if (!window.File && !window.FileReader && !window.FileList && !window.Blob && !window.btoa && !window.atob && !window.Blob && !window.URL) {
      this.setState({
        supported: false,
      })
    }
  }

  componentDidMount() {
    this._fileInput.addEventListener('change', this.confirmFileTransfer.bind(this))
  }

  async encodeFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new window.FileReader()

      if (!file) {
        reject()
        return
      }

      reader.onload = (readerEvent) => {
        resolve(window.btoa(readerEvent.target.result))
        this._fileInput.value = ''
      }

      reader.readAsBinaryString(file)
    })
  }

  async confirmFileTransfer(event) {
    const file = event.target.files && event.target.files[0]

    if (file) {
      const fileType = file.type || 'file'
      const fileName = sanitize(file.name)
      const { localFileQueue } = this.state
      const fileExtension = file.name.split('.').pop().toLowerCase()

      if (VALID_FILE_TYPES.indexOf(fileExtension) <= -1) {
        // eslint-disable-next-line no-alert
        alert('File type not supported')
        return false
      }

      if (file.size > 4 * 1000000) {
        // eslint-disable-next-line no-alert
        alert('Max filesize is 4MB')
        return false
      }

      const fileId = uuid.v4()
      const fileData = {
        id: fileId,
        file,
        fileName,
        fileType,
        encodedFile: await this.encodeFile(file),
      }

      localFileQueue.push(fileData)

      this.setState({
        localFileQueue,
      }, async () => {
        this.props.sendSocketMessage({
          type: 'SEND_FILE',
          payload: {
            fileName: fileData.fileName,
            encodedFile: fileData.encodedFile,
            fileType: fileData.fileType,
            timestamp: Date.now(),
          },
        })
      })
    }

    return false
  }

  canSend() {
    return false
  }

  render() {
    if (!this.state.supported) {
      return null
    }
    return (
      <div className={`${styles} icon file-transfer btn btn-link`}>
        <input type="file" name="fileUploader" id="fileInput" ref={c => this._fileInput = c} />
        <label htmlFor="fileInput">
          <File className={this.canSend() ? '' : 'disabled'} />
        </label>
      </div>
    )
  }
}

FileTransfer.propTypes = {
  sendSocketMessage: PropTypes.func.isRequired,
}
