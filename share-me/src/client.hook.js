import { useContext, useState } from 'react';
import { GenContext, useAuthContext } from "./contexts/GeneralContext";

export const useClientHook = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [customHook, setCustomHook] = useState(undefined);
    const [isUserExist, setUserExist] = useState(null);
    const [isSuccessAuth, setSuccessAuth] = useState(false);
    const [infoAboutFriend, setInfoAboutFriends] = useState(undefined);
    const [ws, setWs] = useState(new WebSocket('ws://localhost:7171'));

    
    ws.onopen = () => {
        console.dir("Online");
    }

    ws.onclose = () => {
        console.dir("Offline");
    }

    ws.onmessage = (payload) => {
        const answer = JSON.parse(payload.data);
        switch(answer.typeRequest) {
            case "checkUser_answer": 
                if(answer.auth) {
                    setUserExist(true);
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

    return {
        isUserExist,
        isSuccessAuth,
        infoAboutFriend,
        phoneNumber,
        tryAuth,
        doEntry,
        doRegister,
        getFriends,
        setInfoAboutFriends,
        setPhoneNumber
    };
}