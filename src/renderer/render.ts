import {data, settings} from "../main/interfaces";
import {ACTION_EMAIL, CHANNELS} from "../config";

const {ipcRenderer} = require("electron")
const stream = require("stream");
const {isNumber} = require("lodash");

let emailStringList = new Set<string>();


document.addEventListener("DOMContentLoaded", ()=>{
    let buttonExtract = document.getElementById("button-generator");
    let emailList = document.getElementById("email-list");

    buttonExtract.onclick=()=>{
        emailStringList.clear();
        emailList.innerHTML = ""
        let deepNumber = document.getElementById("deep-number").querySelector("input").value;
        let settings: settings = {
            isDeep: document.getElementById("deep-search").querySelector("input").checked,
            isAsync: document.getElementById("async-search").querySelector("input").checked,
            deepNumber: isNaN(Number.parseInt(deepNumber)) ? 1 : Number.parseInt(deepNumber)
        }
        // @ts-ignore
        let link = document.getElementById("link-site").value
        let data: data = {
            url: link,
            settings: settings,
        }
        ipcRenderer.send(CHANNELS.EXTRACT_EMAIL, data);
    }

    let downloadButton = document.getElementById("download");
    let copyButton = document.getElementById("copy")

    const fileData = Array.from(emailStringList).join('\n')
    copyButton.onclick = () => {
        navigator.clipboard.writeText(fileData)
            .then(() => {
                let prevText = copyButton.innerText;
                copyButton.innerText = "Скопированно!"
                setTimeout(()=>{
                    copyButton.innerText = prevText;
                },3000)
            })
            .catch(() => {
                console.error('Ошибка копирования текста!');
            });
    }
    downloadButton.onclick = () => {
        // Создаем файл через Blob
        console.log(fileData)
        const blob = new Blob([fileData], { type: 'text/plain' });

        // Создаем URL для скачивания файлаw
        //@ts-ignore
        const url = window.URL.createObjectURL(blob);

        // Создаем ссылку на скачивание и нажимаем на нее
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'emails.txt';
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // Удаляем ссылку и URL
        document.body.removeChild(downloadLink);
        //@ts-ignore
        window.URL.revokeObjectURL(url);
    };
})

ipcRenderer.on(CHANNELS.SAVE_EMAIL, (event, email: string, action: ACTION_EMAIL) => {
    switch (action) {
        case ACTION_EMAIL.ADD: {
            emailStringList.add(email);
            addEmail(email);
            break;
        }
        case ACTION_EMAIL.REMOVE: {
            emailStringList.delete(email);
            removeEmail(email)
            break;
        }
        case ACTION_EMAIL.CLEAR: {
            emailStringList.clear();
            break;
        }
    }
});

function addEmail(email: string) {
    let emailList = document.getElementById("email-list");
    if (document.getElementById(email) !== null) return;
    let li = document.createElement("li");
    li.id = email;
    li.appendChild(document.createTextNode(email));
    emailList.appendChild(li);
}

function removeEmail(email: string) {
    let emailList = document.getElementById("email-list");
    let arrayEmails = Array.from(emailStringList);
    emailList.innerHTML = "";
    for (let email in arrayEmails) {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(email));
        emailList.appendChild(li);
    }
}