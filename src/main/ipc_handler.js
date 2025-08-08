import	{ ipcMain, BrowserWindow }  from 'electron';

const localhost = "http://127.0.0.1:8000";


async function login (username, password) {
	try{
		const response = await fetch(localhost + '/login', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({"username": username, "password": password})
		});
		const data = await response.json();
		return data["Login Status"];
	} catch (error) {
		console.error(error.message);
	}
}


ipcMain.handle('login', async (_event, username, password) => {
	try {
		const success = await login(username, password);
		return success;
	} catch (error) {
		return {"success": false, "error": error.message};
	}
})


ipcMain.handle('switch_to_main_window', async (event) => {
	const win = BrowserWindow.fromWebContents(event.sender)
	if (win) {
		win.loadFile("src/renderer/home.html")
	}
})


ipcMain.handle('search_for_rfq', async (_event, rfq_num) => {
	try {
		const response = await fetch(localhost + `/search-rfq/${rfq_num}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
		});
		const data = await response.json();
		return data["result"];
	} catch (error) {
		console.error(error.message);
	}
})
