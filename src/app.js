// script for index.html
const {ipcRenderer}=require('electron')

function file_sys_toggle() {
	ipcRenderer.send('click-button', 'true')
}

ipcRenderer.send('openFile', () => {})
ipcRenderer.on('fileData', (event, data) => {
	console.log(data)
	document.write(data)
})