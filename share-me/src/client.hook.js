import { useState } from 'react';

export const useClientHook = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [username, setUsername] = useState();
    const [isUserExist, setUserExist] = useState(null);
    const [isSuccessAuth, setSuccessAuth] = useState(false);
    const [infoAboutFriend, setInfoAboutFriends] = useState(undefined);
    const [ws, setWs] = useState(new WebSocket('ws://192.168.0.107:7171'));
    const [outReqFriends, setOutReqFriends] = useState([]);
    const [inReqFriends, setInReqFriends] = useState([]);
    const [avatar, setAvatar] = useState();

    ws.onopen = () => {
        console.dir("Online");
    }

    ws.onclose = () => {
        console.dir("Offline");
    }

    ws.onmessage = (payload) => {
        const answer = JSON.parse(payload.data);
        console.dir(answer);
        switch(answer.typeRequest) {
            case "checkUser_answer": 
                if(answer.auth) {
                    setUserExist(true);
                    setUsername(answer.username);
                    setOutReqFriends(answer.outFriendRequest?.requests);
                    setInReqFriends(answer.inFriendRequest?.requests);
                    setAvatar(answer.avatar);
                    console.warn("Пользователь найден! Просьба ввести пароль...");
                } else {
                    setUserExist(false);
                }
            break;

            case "successAuth":
                setSuccessAuth(true);
            break;

            case "successRegister":
                setSuccessAuth(true);
            break;

            case 'connection_state': 
                console.warn(answer.message);
            break;

            case 'infoAboutFriends':
                console.dir(answer.data);
                console.warn(answer.data);
                setInfoAboutFriends(answer.data);
            break;

            case 'addFriend':
                console.dir(answer);
                console.dir(outReqFriends);
                setOutReqFriends(prevState => {
                    if(prevState) {
                        return [...prevState, {
                            isExist: answer.exist,
                            isFriend: answer.friend,
                            message: answer.message,    
                            username: answer.username,
                            avatar: answer.avatar,
                            phoneNumber: answer.phoneNumber,
                            comment: answer.comment
                        }]
                    } else {
                        return [{
                            isExist: answer.exist,
                            isFriend: answer.friend,
                            message: answer.message,    
                            username: answer.username,
                            avatar: answer.avatar,
                            phoneNumber: answer.phoneNumber,
                            comment: answer.comment
                        }]
                    }
                });
            break;

            case 'friendDeleted':
                getFriends(phoneNumber);
            break;

            case 'rejectFriend':
                // В объекте answer приходит тип события и номер отклоненной заявки 
                // Шерстим все исходящие заявки и отклоняем ту, у которой номер совпадает с пришедшем объектом
                console.dir(outReqFriends);
                console.dir(inReqFriends);
                setOutReqFriends(prevState => prevState.filter(item => item.phoneNumber != answer.receiver));
                setInReqFriends(prevState => prevState.filter(item => item.phoneNumber != answer.sender));
            break;

            case 'friendSuccessfulAccepted':
                console.dir(answer);
                setInfoAboutFriends(prevState => {
                    if(prevState) {
                        return [...prevState, {
                            avatar: answer?.data?.avatar,
                            username: answer?.data?.username,
                            phone_number: answer?.data?.phoneNumber,
                            lat: answer?.data?.lat,
                            lon: answer?.data?.lon
                        }]
                    } else {
                        return [{
                            avatar: answer?.data?.avatar,
                            username: answer?.data?.username,
                            phone_number: answer?.data?.phoneNumber,
                            lat: answer?.data?.lat,
                            lon: answer?.data?.lon
                        }]
                    }
                });

                setInReqFriends(prevState => prevState.filter(item => item.phoneNumber != answer?.data?.phoneNumber));

            break;


            case 'err':
                console.error("Received error message");
                console.dir(answer.message);
            break;

            default:
                console.warn("Пришел запрос, который мы не знаем как обработать! ");
                console.dir(answer);
                break;
        }

    }


    // Функция, вызывающаяся при клике по кнопке "Проверить наличие пользователя"
    function tryAuth(phone) {
        const msg = {
            typeRequest: 'checkUserExist',
            phoneNumber: phone,
        };

        if(ws.readyState == WebSocket.OPEN)
            ws.send(JSON.stringify(msg));
    }

    function doRegister(userName, phone, password) {
        const msg = {
            typeRequest: 'tryToRegister',
            phoneNumber: phone,
            userName: userName,
            userPass: password
        };

        if(ws.readyState == WebSocket.OPEN)
            ws.send(JSON.stringify(msg));
    }

    function doEntry(phone, password) {
        const msg = {
            typeRequest: 'tryToEnter',
            phoneNumber: phone,
            userPass: password
        };

        if(ws.readyState == WebSocket.OPEN)
            ws.send(JSON.stringify(msg));
        
    }

    function getFriends(phoneNumber) {
        const msg = {
            typeRequest: 'getFriends',
            phoneNumber: phoneNumber
        }    

        if(ws.readyState == WebSocket.OPEN) 
            ws.send(JSON.stringify(msg));
    }

    function sendFriendRequest(myNumber, friendNumber, comment, myAvatar) {
        const msg = {
            typeRequest: 'requestFriend',
            myNumber: myNumber,
            friendNumber: friendNumber,
            comment: comment,
            myAvatar: myAvatar,
            myUsername: username
        };

        if(ws.readyState == WebSocket.OPEN) 
            ws.send(JSON.stringify(msg));
    }

    function DeleteFriend(myNumber, friendNumber) {
        const msg = {
            typeRequest: 'deleteFriend',
            myNumber: myNumber,
            friendNumber: friendNumber
        };

        if(ws.readyState == WebSocket.OPEN) 
            ws.send(JSON.stringify(msg));
    }

    function AcceptFriend(myNumber, friendNumber) {
        const msg = {
            typeRequest: 'acceptFriend',
            myNumber: myNumber,
            friendNumber: friendNumber
        };

        if(ws.readyState == WebSocket.OPEN) 
            ws.send(JSON.stringify(msg));
    }

    function RejectFriend(senderNumber, receiverNumber) {
        const msg = {
            typeRequest: 'rejectFriend',
            senderNumber: senderNumber,
            receiverNumber: receiverNumber 
        };

        if(ws.readyState == WebSocket.OPEN) 
            ws.send(JSON.stringify(msg));
    }
    

    return {
        isUserExist,
        isSuccessAuth,
        infoAboutFriend,
        phoneNumber,
        outReqFriends,
        username,
        avatar,
        inReqFriends,
        tryAuth,
        doEntry,
        doRegister,
        getFriends,
        setInfoAboutFriends,
        setPhoneNumber,
        sendFriendRequest,
        DeleteFriend,
        AcceptFriend,
        RejectFriend
    };
}