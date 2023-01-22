const WebSocket = require('ws');
const server = new WebSocket.Server({port: 7171}); 
const mysql = require('mysql');
const config = require("./config");

server.on('connection', ws => {
    console.dir("Connection was opened.");

    const commonMessage = {
        typeRequest: 'connection_state',
        message: 'Connection was opened.'
    };
    ws.send(JSON.stringify(commonMessage));

    ws.on('message', (payload) => {
        const msg = JSON.parse(payload);
        switch(msg.typeRequest) {
            case 'checkUserExist':
                checkExistUser(msg.phoneNumber).then(record => {
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
                                phoneNumber: msg.phoneNumber,
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
                                phoneNumber: msg.phoneNumber,
                                user: msg.phoneNumber,
                                auth: true
                            };
                            ws.send(JSON.stringify(msgToClient));
                        } else {
                            console.log("ACCESS IS BLOCK")
                        }
                    })
                    break;

                case 'getFriends':
                    getFrindsByNumber(msg.phoneNumber).then(resolve => {
                        if(resolve.length > 0) {
                            const phoneNumbers = resolve[0].list_friends;
                            getInfoAboutFriends(phoneNumbers).then(resolve => {
                                const msgToClient = {
                                    typeRequest: 'infoAboutFriends',
                                    data: resolve
                                };
                                ws.send(JSON.stringify(msgToClient));
                            }, reject => {
                                const msgToClient = {
                                    typeRequest: 'infoAboutFriends',
                                    data: []
                                };
                                console.log("No friends");
                                ws.send(JSON.stringify(msgToClient));
                            });
                        } else {
                            const msgToClient = {
                                typeRequest: 'infoAboutFriends',
                                data: []
                            };
                            console.log("No friends");
                            ws.send(JSON.stringify(msgToClient));
                        }
                        
                    }, reject => {
                        const msgToClient = {
                            typeRequest: 'infoAboutFriends',
                            data: []
                        };
                        console.log("No friends");
                        ws.send(JSON.stringify(msgToClient));
                    })
                    break;

                case 'requestFriend':
                        //Promise().then(resolve => {}, reject => {})
                        RequestFrined(msg.myNumber, msg.friendNumber, msg.comment).then(resolve => {
                            console.dir(resolve);
                            ws.send(JSON.stringify(resolve));
                        }, reject => {
                            console.dir(reject);
                            ws.send(JSON.stringify(reject));
                        });
                break;

            default:
                console.dir("There are no corresponded actions");
                break;
        };
    });
})


server.on('close', ws => {
    console.dir("Connection was closed.")
    ws.send("Connection was closed.");
})

server.on('error', err => {
    console.dir(err);
})

// ---------------------------- Function for work with databases ---------------------------- //
async function RequestFrined(myNumber, friendNumber, comment) {
    const conn = mysql.createConnection(config);
    return new Promise((resolve, reject) => {
        if(tryConnect(conn)) {
            conn.query(`select * from user_table where phone_number = '${friendNumber}'`, (err, result) => { 
                if(err) {
                    const msgToClient = {
                        typeRequest: 'err',
                        message: 'Ошибка подключения к базе данных!',
                        exist: false,
                        friend: false
                    };
                    reject(msgToClient); 
                } else if(result.length == 0) {
                    const msgToClient = {
                        typeRequest: 'err',
                        message: 'Добавляемого пользователя не существует в системе!',
                        exist: false,
                        friend: false
                    };
                    reject(msgToClient); 
                } else if(result.length > 0) {
                    console.dir("User was found, check list friends");
                    const {username, avatar} = result[0];
                    conn.query(`select list_friends from user_table where phone_number = '${myNumber}'`, (err, result) => {
                        if(err) {       
                            const msgToClient = {
                                typeRequest: 'err',
                                message: 'Ошибка подключения к базе данных!',
                                exist: true,
                                friend: false
                            };
                            reject(msgToClient); 
                        } else if(result.length == 0) {
                            const msgToClient = {
                                typeRequest: 'addFriend',
                                message: 'Друг найден, можем добавить в друзья',
                                exist: true,
                                friend: false,
                                usernameFriend: username,
                                avatarFriend: avatar,
                                numberFriend: friendNumber,
                                comment: comment
                            };
                            resolve(msgToClient); 
                        } else if(result.length > 0) {
                            const massive_friends = result[0].list_friends.split(',');  // список друзей
                            let i=0;
                            while(i < massive_friends.length && massive_friends[i] != friendNumber)
                                i++;

                            if(i < massive_friends.length) {
                                const msgToClient = {
                                    typeRequest: 'err',
                                    message: 'Добавляемый пользователь уже существует в друзьях пользователя!',
                                    exist: true,
                                    friend: true,
                                }  
                                reject(msgToClient); //Если добавляемый уже в списке друзей
                            } else {
                                const msgToClient = {
                                    typeRequest: 'addFriend',
                                    message: 'Друг найден, можем добавить в друзья',
                                    exist: true,
                                    friend: false,
                                    usernameFriend: username,
                                    avatarFriend: avatar,
                                    numberFriend: friendNumber,
                                    comment: comment
                                }  
                                resolve(msgToClient); //Если добавляемый уже в списке друзей 
                            }
                            // 1) Добавить заявку в in_friend -> friendNumber
                            // 2) Добавить заявку в out_friend -> myNumber
                        }
                    }); 
                }
            });
        } else {
            reject("Failed connection to database");
        }
    })
}

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

// Получаем данные о друзьях пользователя phoneNumber
async function getFrindsByNumber(phoneNumber) {
    return new Promise((resolve, reject) => {
        const conn = mysql.createConnection(config);
        if(tryConnect(conn)) {
            conn.query(`select list_friends from user_table where phone_number = '${phoneNumber}'`, (err, result) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(result);
                }
            })
        } else {
            reject("Failed connection to database3");
        }
    })
}


async function getInfoAboutFriends(numbers) {
    return new Promise((resolve, reject)=> {
        const conn = mysql.createConnection(config);
        if(tryConnect(conn)) {
            const friends = [];
            const split_massive = numbers.split(',');
            console.dir(split_massive);
            split_massive.forEach((element) => {
                const info = {
                    username: null,
                    phone_number: element,
                    avatar: null ,
                    lat: null,
                    lon: null,
                };

                conn.query(`select username from user_table where phone_number = '${element}'`, (err, result) => {
                if(err) {
                    friends.push(info);
                    reject(err)
                } else {
                    info.username = result[0].username;
                    console.dir("Username: " + info.username);
                        conn.query(`select avatar from user_table where phone_number = '${element}'`, (err, result) => {
                        if(err) {
                            friends.push(info);
                            reject(err)
                        } else {
                            info.avatar = result[0].avatar;
                            console.dir("Avatar: " + info.avatar);
                                conn.query(`select lat from user_table where phone_number = '${element}'`, (err, result) => {
                                if(err) {
                                    friends.push(info);
                                    reject(err)
                                } else {
                                    info.lat = result[0].lat;
                                    console.dir("Lat: " + info.lat);
                                        conn.query(`select lon from user_table where phone_number = '${element}'`, (err, result) => {
                                        if(err) {
                                            friends.push(info);
                                            reject(err)
                                        } else {
                                            info.lon = result[0].lon;
                                            console.dir("Lon: " + info.lon);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }});
                friends.push(info);
            });

            setTimeout(() => {
                resolve(friends);
            }, 100);
        } else {
            reject("Cannot execute get info about frineds");
        }
    }

    )
}

//////////////////////////////////

// Function to add in_req, out_req 
// if(!isFrined)
                            // {
                            //     //запрашиваем список входящих заявок друга
                            //     conn.query(`select in_friend_req from user_table where phone_number = '${friendNumber}'`, (err, result) => {
                            //     if(!err) {      
                            //         result = result[0].in_friend_req + myNumber.toString();
                            //         conn.query(`UPDATE user_table SET in_friend_req ='${result}' where phone_number='${friendNumber}'`, (err, result) => {
                            //         if(err) {
                            //             const msgToClient= {
                            //                 typeRequest:'OtherError',
                            //                 text:'OtherError: ' + err}
                            //             reject(msgToClient);
                            //         } else{
                            //                 conn.query(`select out_friend_req from user_table where phone_number = '${myNumber}'`, (err, result) => {
                            //                     console.dir("/////4")
                            //                 if(err)
                            //                 {
                            //                     const msgToClient= {
                            //                         typeRequest:'OtherError',
                            //                         text:'OtherError: ' + err}
                            //                     reject(msgToClient);
                            //                 } else {
                            //                         console.dir("+++"+ result)
                            //                         result=result[0].out_friend_req+friendNumber.toString();
                            //                         conn.query(`UPDATE user_table SET out_friend_req ='${result}' where phone_number='${myNumber}'`, (err, result) => {
                            //                             console.dir("/////6")
                            //                         if(err) {
                            //                             const msgToClient= {
                            //                                 typeRequest:'OtherError',
                            //                                 text:'OtherError: ' + err}
                            //                             reject(msgToClient);
                            //                         } else {
                            //                             const msgToClient = {
                            //                             typeRequest: 'addFriend',
                            //                             exist: true,
                            //                             friend: false,
                            //                             friend_avatar: 0,
                            //                             friend_username:0, };
                            //                             resolve(msgToClient)
                            //                         }});
                            //                 }});
                            //         }});
                            //     }});
                            // }