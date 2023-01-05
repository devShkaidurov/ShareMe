var clients = new Map();  ///key-valuse
var id=0;

const WebSocket = new require('ws');
const server = new WebSocket.Server({port:3000});



server.on('connection',ws => {
    var tmp_id=id;
    id++
    clients.set(tmp_id,ws);
    ws.send("Server: new client connection ID " + tmp_id );
    console.log(tmp_id);


    ws.on('message',message => {
      const json = JSON.parse(message);
      switch (json.type)
      {
        case "user_info":
            {
                console.log(json);
            }
       
      }

    })

})