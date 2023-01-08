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
            case 'checkUserExist':
                checkExistUser(msg.phoneNumber).then(record => {
                     // Отправляем данные обратно в клиент
                    console.dir(record);
                    if(record != undefined && record != null && record.length > 0) {
                        const msgToClient = {
                            typeRequest: 'checkUser_answer',
                            username: record[0].username,
                            lat: record[0].lat,
                            lon: record[0].lon,
                            list_friends: record[0].list_friends,
                            auth: true,
                            err: ""
                        };
                        ws.send(JSON.stringify(msgToClient));
                    } else {
                        const msgToClient = {
                            typeRequest: 'checkUser_answer',
                            auth: false,
                            err: "Не найден такой пользователь!"
                        };
                        ws.send(JSON.stringify(msgToClient));
                    }

                }, reject => {
                    console.dir(reject);
                    const msgToClient = {
                        typeRequest: 'checkUser_answer',
                        auth: false,
                        err: reject
                    };
                    ws.send(JSON.stringify(msgToClient));
                }).catch(err => {
                    console.dir(err);
                    const msgToClient = {
                        typeRequest: 'checkUser_answer',
                        auth: false,
                        err: err
                    };
                    ws.send(JSON.stringify(msgToClient));
                })
                break;

                case 'tryToRegister':
                    console.dir(msg);
                    registerUser(msg.userName, msg.phoneNumber, msg.userPass).then(ans => {
                        if(ans != null && ans != undefined) {
                            const msgToClient = {
                                typeRequest: 'successRegister',
                                user: msg.phoneNumber,
                                auth: true
                            };
                            ws.send(JSON.stringify(msgToClient));
                        }
                    }, reject => {
                        console.dir(reject);
                    });
                    
                    break;

                case 'tryToEnter':
                    entryUser(msg.phoneNumber, msg.userPass).then(record => {
                        if(record != undefined && record != null && record.length > 0) {
                            const msgToClient = {
                                typeRequest: 'successAuth',
                                user: msg.phoneNumber,
                                auth: true
                            };
                            ws.send(JSON.stringify(msgToClient));
                        } else {
                            console.log("ACCESS IS BLOCK")
                        }
                    })
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

// Проверка, существует ли такой пользователь
async function checkExistUser(phone_number) {
    const conn = mysql.createConnection(config);
    if(tryConnect(conn)) {
        return new Promise((resolve, reject) => {
            conn.query(`select * from user_table where phone_number = '${phone_number}'`, (err, result) => {
                if(err) {
                    reject("Occurs error while we trying to get data from database.");
                }
                else 
                    resolve(result); // Присваиваение синхронное в асинхронном моменте
            });
        

            // В любом случае надо закрыть соединение с базой данных
            conn.end(err => {
                if(err)
                    console.error("Connection to database was closed by error.");
                else 
                    console.dir("Connection to database was closed.");
            })
        });
    }
}

// Регистрируем пользователя
async function registerUser(user_name, user_phone, user_password) {
    const conn = mysql.createConnection(config);
    return new Promise((resolve, reject) => {
        if(tryConnect(conn)) {
            conn.query(`INSERT user_table(username, phone_number, user_pass, lat, lon) values ('${user_name}', '${user_phone}', '${user_password}', 52.2323, 50.11111)`, (err, result) => {
                if(err) {
                    reject("Error while adding!" + err);
                } else {
                    resolve(result);
                }
            });
        } else {
            reject("Failed connection to database.");
        }

         // В любом случае надо закрыть соединение с базой данных
         conn.end(err => {
            if(err)
                console.error("Connection to database was closed by error.");
            else 
                console.dir("Connection to database was closed.");
        })
    })
}

// Входим с существующей учетной записью (проверяем логин и пароль)
async function entryUser(user_phone, user_password) {
    const conn = mysql.createConnection(config);
    console.log("Props phone: " + user_phone);
    console.log("Props password: " + user_password);
    return new Promise((resolve, reject) => {
        if(tryConnect(conn)) {
            conn.query(`select * from user_table where phone_number = '${user_phone}' and user_pass = '${user_password}'`, (err, result) => {
                if(err) {
                    reject('Error while trying to enter!' + err);
                } else {
                    console.log("RESULT:");
                    console.dir(result);
                    resolve(result);
                }
            });
        } else {
            reject("Failed connection to database");
        }
    })
}

// Подключаемся к бд. 
// Возвращаем true, если подключение удачное. False - если не смогли подключиться 
async function tryConnect(conn) {
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