import {data} from "./interfaces";

import {app, BrowserWindow, ipcMain, Menu} from "electron";
import {ACTION_EMAIL, CHANNELS} from "../config";
import {isExternalLink, readURL} from "./utils";
import {CheerioAPI} from "cheerio";

const cheerio = require("cheerio");

const path = require("path")
const url = require("url")


let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 450,
        icon: "./main-icon.ico",
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    const menu = Menu.buildFromTemplate([])
    Menu.setApplicationMenu(menu)
    win.loadFile(path.join(__dirname, 'index.html'));

    win.on('closed', ()=> {
        win = null;
    })
}

ipcMain.on(CHANNELS.EXTRACT_EMAIL, async (event, data: data) => {
    await deepExtractEmails(data, function (email, action) {
        console.log(`Email "${email}" has been processed`)
        event.sender.send(CHANNELS.SAVE_EMAIL, email, action)
    })
});

async function deepExtractEmails(data: data, renderFunction: ( newEmail: string, action: ACTION_EMAIL )=>void) {
    let url = data.url;
    let maxDeep = data.settings.isDeep ? data.settings.deepNumber : 1
    let isAsync = data.settings.isAsync;

    await generateExtractFunction(url, 1, maxDeep, renderFunction);

}

async function generateExtractFunction(url: string, currentDeep: number, maxDeep: number, renderFunction: ( newEmail: string, action: ACTION_EMAIL )=>void) {
    asyncGetCheerioDoc(url, async (doc)=> {
        asyncExtractEmails(doc, async (email)=>{
            renderFunction(email, ACTION_EMAIL.ADD);
        })
        if (currentDeep < maxDeep) {
            asyncExtractLinks(doc, async (url)=>{
                generateExtractFunction(url, currentDeep+1, maxDeep, renderFunction)
            })
        }
    })
}

async function asyncGetCheerioDoc(url: string, cheerioDocHandler: (doc: CheerioAPI)=>Promise<void>) {
    try {
        let htmlContent = await readURL(url);
        let doc = cheerio.load(htmlContent)
        cheerioDocHandler(doc);
        console.log(`URL "${url} has been processed`)
    } catch (e) {
        console.log(`Processing error URL "${url}". Message:\n`+e.message)
    }
}

async function asyncExtractLinks(doc: CheerioAPI, linkHandler: (url: string)=>Promise<void>) {
    doc('a').each(function() {
        if (isExternalLink(doc(this).attr('href'))) {
            linkHandler(doc(this).attr('href'));
        }
    });
}

async function asyncExtractEmails(doc: CheerioAPI, emailHandler: (email: string) => Promise<void>) {
    doc('a[href^="mailto:"]').map((i, el) => {
        emailHandler(doc(el).attr('href').slice(7));
    });
}

app.on('ready', createWindow)
app.on('window-all-closed', ()=> {
    app.quit();
})
