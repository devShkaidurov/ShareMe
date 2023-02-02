import { useState } from 'react';

export const useClientHook = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [username, setUsername] = useState();
    const [isUserExist, setUserExist] = useState(null);
    const [isSuccessAuth, setSuccessAuth] = useState(false);
    const [infoAboutFriend, setInfoAboutFriends] = useState(undefined);
    const [ws, setWs] = useState(new WebSocket('ws://localhost:7171'));
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
                    setOutReqFriends(answer.outFriendRequest.requests);
                    setInReqFriends(answer.inFriendRequest.requests);
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
                console.warn(answer.data);
                setInfoAboutFriends(answer.data);
            break;

            case 'addFriend':
                setOutReqFriends(prevState => [...prevState, {
                    isExist: answer.exist,
                    isFriend: answer.friend,
                    message: answer.message,    
                    usernameFriend: answer.usernameFriend,
                    avatarFriend: answer.avatarFriend,
                    numberFriend: answer.numberFriend,
                    comment: answer.comment
                }]);
            break;

            case 'friendDeleted':
                getFriends(phoneNumber);
                console.dir(answer);
            break;

            case 'rejectFriend':
                console.dir(answer);
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
            username: username
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