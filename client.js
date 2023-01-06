const ws = new WebSocket('ws://localhost:7171');

ws.onopen = () => {
    console.dir("Online");
}

ws.onclose = () => {
    console.dir("Offline");
}

ws.onmessage = (payload) => {
    const answer = JSON.parse(payload.data);
    switch(answer.typeRequest) {
        case "findUser": 
            displayData(answer);
        break;

        default:
            console.warn("Пришел запрос, который мы не знаем как обработать! ");
            console.dir(payload.data);
            break;
    }

}


// Функция, вызывающаяся при клике по кнопке "Проверить наличие пользователя"
function tryRegister() {
    const phoneNumber = document.getElementById('phoneInput').value;
    console.dir("Sending data to server...");
    const msg = {
        typeRequest: 'checkUser',
        phoneNumber: phoneNumber
    }
    ws.send(JSON.stringify(msg));   // надо бы добавить валидацию: создано ли такое ws соединение? 
}


// Вывести данные о найденном пользователе
function displayData(payload) {
    const txtElement = document.getElementById('txtaUserInfo');
    let text = "";
    Object.keys(payload).forEach((item, index) => {
        text += `${index}) ${item}: ${payload[item]}\n`;
    });
    txtElement.innerHTML = text;
}