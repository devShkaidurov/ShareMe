import { useState } from 'react';

export const useClientHook = () => {
    // const [isAuthSuccess, setAuthSuccess] = useState(false);
    const [isUserExist, setUserExist] = useState(false);
    const [isSuccessAuth, setSuccessAuth] = useState(false);
    const ws = new WebSocket('ws://localhost:7171');

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
                    console.warn("Пользователь найден! Просьба ввести пароль...");
                } 
            break;

            case "successAuth":
                setSuccessAuth(true);
                break;

            case "successRegister":
                setSuccessAuth(true);
            break;

            default:
                console.warn("Пришел запрос, который мы не знаем как обработать! ");
                console.dir(answer);
                break;
        }

    }


    // Функция, вызывающаяся при клике по кнопке "Проверить наличие пользователя"
    function tryAuth(phone) {
        console.dir("Sending data to server...");
        const msg = {
            typeRequest: 'checkUserExist',
            phoneNumber: phone,
        };
        if(ws.readyState !== WebSocket.CLOSED)
            ws.send(JSON.stringify(msg));   // надо бы добавить валидацию: создано ли такое ws соединение? 
    }

    function doRegister(userName, phone, password) {
        console.dir("Trying register...");

        const msg = {
            typeRequest: 'tryToRegister',
            phoneNumber: phone,
            userName: userName,
            userPass: password
        };
        console.dir(msg);
        if(ws.readyState !== WebSocket.CLOSED)
            ws.send(JSON.stringify(msg));
    }

    function doEntry(phone, password) {
        console.dir("Trying enter...");
        const msg = {
            typeRequest: 'tryToEnter',
            phoneNumber: phone,
            userPass: password
        };

        if(ws.readyState !== WebSocket.CLOSED)
            ws.send(JSON.stringify(msg));
    }

    return {
        tryAuth,
        isUserExist,
        // isAuthSuccess,
        isSuccessAuth,
        doEntry,
        doRegister
    };
}