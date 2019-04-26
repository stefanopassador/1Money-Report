import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import {fs} from 'fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
	app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let csvPath;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
	});

	// and load the index.html of the app.
	mainWindow.loadURL(`file://${__dirname}/index.html`);

	// Open the DevTools.
	mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('openFile', (event, arg) => {
	const {dialog} = require('electron')
	const fs = require('fs')
	var dataForge = require('data-forge');
	var dataForgeFS =  require('data-forge-fs');
	var dataForgePlot = require('data-forge-plot');


	ipcMain.on('click-button', (event, arg) => {
		if (arg == 'true') {
			dialog.showOpenDialog(function(fileNames) {
				if (fileNames == undefined) {
					console.log("No file selected");
				} else {
					csvPath = fileNames[0];
					console.log(csvPath);

					// WITH DATA-forge
					var df = dataForgeFS.readFileSync(csvPath).parseCSV();

					// rename column
					const renamedDf = df.renameSeries({ "\"DATE\"": "DATE" });

					// split dataframe into history and summary
					const history = renamedDf.takeUntil(row => row.DATE === "" && row.TYPE === "");
					const summaryTmp = renamedDf.after(history.toArray().length)
					const summary = dataForge.fromCSV(summaryTmp.toCSV({ header: false }))
							.dropSeries([".1", ".2", ".3", ".4", ".5", ".6", ".7"]);

					console.log("HISTORY")
					console.log(history.toString())
					console.log("SUMMARY")
					console.log(summary.toString())
				}
			})
		}
	})
})
