import {CheerioAPI} from "cheerio";

const cheerio = require("cheerio")

const https = require("https");

export function readURL(url: String): Promise<string> {

    // возвращаем Promise - так как операция чтения может длиться достаточно долго
    return new Promise((resolve, reject) => {

        // встроенный в NodeJS модуль https
        // первый аргумент - url, второй - callback c параметром ответа сервера

        https.get(url, (res) => {

            // получаем статус ответа сервера посредством деструктуризации объекта
            const { statusCode } = res;


            let error;
            if(statusCode === 301 || statusCode === 302 || statusCode == 307) {
                let newRequestUri = res.headers.location;
                console.log(`Url "${url}" relocated to "${newRequestUri}"`)
                let newUrl = readURL(newRequestUri);
                resolve(newUrl);
                res.resume();
                return;
            }
            else if (statusCode !== 200) {
                error = new Error(`Error request. Code: ${statusCode}`);
            }


            // при ошибке очищаем память и выходим
            if (error) {
                reject(error);
                res.resume();
                return;
            }


            // устанавливаем кодировку
            res.setEncoding('utf8');

            // собираем данные в строку
            let rawData = '';
            res.on('data', chunk => rawData += chunk);

            // после получения всех данных успешно завершаем Промис
            res.on('end', () => resolve(rawData));



        }).on('error', (e) => reject(e)); // ошибка -> отклоняем Промис
    })
}

export function isExternalLink(link): boolean {
    if (link == undefined) return false
    return link.indexOf('https://') !== -1 && link.indexOf('#') === -1;
}
