console.log("Сайт запущен! ver1.0");

let ws = new WebSocket('ws://localhost:3000');

class Userinfo
{
    user_name = null;
    user_passwoed = null;
    user_number = 89093717197;
    

    long = null;
    lat = null;
    // accuracy = null;
    // altitude = null;s
    // headind = null;
    // speed = null;
    // timestamp = null;

    // city= null;
    // continentCode= null;
    // continentName= null;
    // countryCode= null;
    // countryName= null;
    // ipAddress= null;
    // stateProv= null;


    constructor()
    {
        this.timeOpened=new Date();
        this.timezone=(new Date()).getTimezoneOffset()/60; //Получение смещения времени юзера
        
    }
    pageon(){ return window.location.pathname}
    browserInfo() {return navigator;}

    async position()
    {
        const pos=await new Promise((resolve,reject)=>{navigator.geolocation.getCurrentPosition(resolve,reject);});

        
        this.long = pos.coords.longitude;
        this.lat = pos.coords.latitude;
        this.accuracy = pos.coords.accuracy;
        this.altitude = pos.coords.altitude;
        this.headind = pos.coords.headind;
        this.speed = pos.coords.speed;
        this.timestamp = this.timestampToDate(new Date().getTime());

    }
    async ip()
    {
        let res = (await fetch('https://api.db-ip.com/v2/free/self'));
        let data = await res.json();
        this.city= data.city;
        this.continentCode= data.continentCode;
        this.continentName= data.continentName;
        this.countryCode= data. countryCode;
        this.countryName= data.countryName;
        this.ipAddress= data.ipAddress;
        this.stateProv= data.stateProv;
        
    }

    timestampToDate(ts) {
        var d = new Date();
        d.setTime(ts);
        return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear();
    }
    
}


//                   main                //

let person = new Userinfo();
Update();

let json_message_userinfo=JSON.stringify({
    type : "user_info",
    user_name : person.user_name,
    user_passwoed : person.user_passwoed,
    user_number : person.user_number,
    long : person.long,
    lat : person.lat});

ws.onopen = () => { 
    document.getElementById('text1').innerHTML="connected"
    ws.send(json_message_userinfo);
}
ws.onclose = () => { document.getElementById('text1').innerHTML="disconnected"}



sendMessage(ws,json_message_userinfo);

function waitForOpenSocket(socket) {
    return new Promise((resolve, _reject) => {
      while (socket.readyState !== socket.OPEN) { /* no-op */ }
      return resolve()
    })
  }
  
  async function sendMessage(socket, msg) {
    await waitForOpenSocket(socket)
    socket.send(msg)
  }



console.log(json_message_userinfo);   





async function Update()
{
    // await person.position();
    // await person.ip()
    // console.log("Дата :      "+ person.timestamp);
    console.log("Ширина :    " + person.lat);
    console.log("Долгота  :  " + person.long );

}





//                   main                //

// ws.onmessage = response => {
//     console.log("Message from server :"+ response.data)
//     document.getElementById('text2').innerHTML=response.data;
// }
