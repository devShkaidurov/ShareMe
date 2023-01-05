const WebSocket = require('ws');
const server = new WebSocket.Server({port: 7171}); 
const mysql = require('mysql');
const config = require("./config");

server.on('connection', ws => {
    console.dir("Connection was opened.");
    ws.send("Connection was opened.");
    ws.onmessage = (payload) => {
        const msg = JSON.parse(payload.data);
        switch(msg.typeRequest) {
            case 'checkUser':
                console.dir(msg.phoneNumber);
                const record = getDataFromDB(msg.phoneNumber);
                // ОШИБКА! 
                // record возвращается пустой! Тк в функции getDataFromDB() он присваивается асинхронно
                // предполагаю делать через колбеки или промисы

                // Отправляем данные обратно в клиент
                // if(record != undefined && record != null) {
                //     console.dir("In record");
                //     const msgToClient = {
                //         typeRequest: 'findUser',
                //         id: record[0].id,
                //         username: record[0].username,
                //         phone_number: record[0].phone_number,
                //         user_pass: record[0].user_pass,
                //         avatar: record[0].avatar,
                //         lat: record[0].lat,
                //         lon: record[0].lon,
                //         list_friends: record[0].list_friends,
                //     };
                //     ws.send(JSON.stringify(msgToClient));
                // }
                break;

            default:
                console.dir("There are no corresponded actions");
                break;
        };
    };
})


server.on('close', ws => {
    console.dir("Connection was closed.")
    ws.send("Connection was closed.");
})

server.on('error', err => {
    console.dir(err);
})


// ---------------------------- Function for work with databases ---------------------------- //

// Получение данных из базы данных
// Если принимает один аргумент - номер телефона, то возвращает найденную запись
// Если запись с таким номером не найдена - возвращается пустой массив.
// Если номер телефона == "" (т.е. юзер не заполнил его), то возвращает все записи из бд (имитирую перегрузку, хз зачем пока, но пусть будет)
async function getDataFromDB(phone_number) {
    let record = {}
    const conn = mysql.createConnection(config);
    if(tryConnect(conn)) {
        if(phone_number == "") {
            conn.query("select * from user_table", (err, result) => {
                if(err) {
                    console.error("Occurs error while we trying to get data from database.");
                }
                else 
                    record = result; // Присваиваение синхронное в асинхронном моменте
            });
        } else {
            conn.query(`select * from user_table where phone_number = '${phone_number}'`, (err, result) => {
                if(err) {
                    console.error("Occurs error while we trying to get data from database.");
                }
                else 
                    record = result; // Присваиваение синхронное в асинхронном моменте
            });
        }
    }

    // В любом случае надо закрыть соединение с базой данных
    conn.end(err => {
        if(err)
            console.error("Connection to database was closed by error.");
        else 
            console.dir("Connection to database was closed.");
    })

    console.dir(record);
    return record;
}

// Подключаемся к бд. 
// Возвращаем true, если подключение удачное. False - если не смогли подключиться 
async function tryConnect (conn) {
    await conn.connect(err => {
        if(err) {
            console.dir("Failed connection to database");
            return false;
        }
        else {
            console.dir("Success connection to database");
            return true;
        }
    });
}