const ws = new WebSocket('ws://localhost:7171');

ws.onopen = () => {
    console.dir("Online");
}

ws.onclose = () => {
    console.dir("Offline");
}

ws.onmessage = (payload) => {
    console.dir(payload);
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
