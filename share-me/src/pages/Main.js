import '../assets/styles/main.css';
import { GenContext } from "../contexts/GeneralContext";
import { useContext, useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import Modal from '../libs/Modal/modal_display.jsx';
import { useNavigate } from 'react-router';
import Map from "@arcgis/core/Map";
import esriRequest from "@arcgis/core/request";
import Color from "@arcgis/core/renderers/PointCloudClassBreaksRenderer";
import SceneView from "@arcgis/core/views/SceneView";
import BaseTileLayer from "@arcgis/core/layers/BaseTileLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';

const Main = () => {
    const ContextStructure = useContext(GenContext);
    const [infoFriends, setInfoFriends] = useState([]);
    const [activeModal, setActiveModal] = useState(false);
    const [isOpenFriend, setIsOpenFriend] = useState(false);
    const [typeFriend, setTypeFriend] = useState();      // for modal in open friend
    const [indexFriend, setIndexFriend] = useState();    // for modal in open friend
    const navigate = useNavigate();
    const [graphicsLayer, setGraphicsLayer] = useState();
    let TintLayer;

    function createMap() {
        TintLayer = BaseTileLayer.createSubclass({
            properties: {
              urlTemplate: null,
              tint: {
                value: null,
                type: Color
              }
            },
  
            getTileUrl: function (level, row, col) {
              return this.urlTemplate
                .replace("{z}", level)
                .replace("{x}", col)
                .replace("{y}", row);
            },
  
            fetchTile: function (level, row, col, options) {
              const url = this.getTileUrl(level, row, col);
  
              return esriRequest(url, {
                responseType: "image",
                signal: options && options.signal
              }).then(
                function (response) {
                  const image = response.data;
                  const width = this.tileInfo.size[0];
                  const height = this.tileInfo.size[0];
  
                  const canvas = document.createElement("canvas");
                  const context = canvas.getContext("2d");
                  canvas.width = width;
                  canvas.height = height;
  
                  if (this.tint) {
                    context.fillStyle = this.tint.toCss();
                    context.fillRect(0, 0, width, height);
  
                    context.globalCompositeOperation = "difference";
                  }
  
                  context.drawImage(image, 0, 0, width, height);
  
                  return canvas;
                }.bind(this)
              );
            }
          });
    }

    function createMapPart2() {
        const stamenTileLayer = new TintLayer({
            urlTemplate:
              "http://tile.openstreetmap.org/{z}/{x}/{y}.png"
          });
  
         
          // add the new instance of the custom tile layer the map
          const map = new Map({
            layers: [stamenTileLayer]
          });
  
          const _graphicsLayer = new GraphicsLayer();
          setGraphicsLayer(_graphicsLayer);
          map.add(_graphicsLayer);
          // create a new scene view and add the map
          const view = new SceneView({
            container: "viewDiv",
            map: map,
            center: {
                latitude: '53.22361308554965',
                longitude: '50.2148368711263'
              },
              zoom: 12,
            environment: {
              lighting: {
                type: "virtual"
              }
            }
          });
          view.ui.components = ([]);
    }


    useEffect(() => {
        createMap();
        createMapPart2();
    }, []);
 
    useEffect(() => {
        if(ContextStructure && ContextStructure.isSuccessAuth == false) 
            navigate('/');
        ContextStructure.getFriends(ContextStructure.phoneNumber);
    }, []);

    useEffect(() => {
        console.dir(ContextStructure.infoAboutFriend);
        graphicsLayer?.removeAll();
        if(ContextStructure.infoAboutFriend && ContextStructure.infoAboutFriend.length > 0) {
            const tempArr = [];
            
            ContextStructure.infoAboutFriend.forEach(friend => {
                const point = {
                    type: "point", 
                    latitude: friend.lat,
                    longitude: friend.lon
                  };
            
                  const markerSymbol = {
                    type: "point-3d", 
                    symbolLayers: [{
                        type: "icon", 
                        size: 25, 
                        resource: { href: friend.avatar }
                    }]
                  };

                  const pointGraphic = new Graphic({
                    geometry: point,
                    symbol: markerSymbol
                  });
            
                  graphicsLayer.add(pointGraphic);

                tempArr.push(friend);
            });

            setInfoFriends(tempArr);
        }
    }, [ContextStructure.infoAboutFriend]);


    const handleAddFriend = () => {
        setActiveModal(true);
    }

    const sendFriendRequest = () => {
        const friendNumber = document.getElementById('inputNumber_modal').value;
        const comment = document.getElementById('inputComment_modal').value;
        ContextStructure.sendFriendRequest(ContextStructure.phoneNumber, friendNumber, comment, ContextStructure.avatar);
        setActiveModal(false);
        document.getElementById('inputNumber_modal').value = "";
        document.getElementById('inputComment_modal').value = "";
    }

    const handleOpenFriend = (e) => {
        console.dir(e);
        console.dir(e.target.id.match("current") ? "current" : e.target.id.match("in") ? "in" : "out");
        console.dir(e.target.id[e.target.id.length - 1]);
        setIndexFriend(e.target.id[e.target.id.length - 1]);
        setTypeFriend(e.target.id.match("current") ? "current" : e.target.id.match("in") ? "in" : "out");
        setIsOpenFriend(true);
    }

    useEffect(() => {
        console.dir(ContextStructure.inReqFriends);
    }, [ContextStructure.inReqFriends]);

    useEffect(() => {
        console.dir(ContextStructure.outReqFriends);
    }, [ContextStructure.outReqFriends]);


    // Отменить свою заявку (работает корректно)
    const handleCancelRequest = (event) => {
        event.stopPropagation();            // чтобы событие клика не проходило дальше и открывало модалку, останавливаем пропагинацию
        const index = event?.target?.id;
        if(index) {
            console.warn("Отмена заявки...");
            ContextStructure.RejectFriend(ContextStructure.phoneNumber, ContextStructure.outReqFriends[index].phoneNumber);
        } 
    }

    // Удалить друга (надо доделать на сервере)
    const handleDeleteFriend = (event) => {
        const index = event?.target?.id;
        if(index) {
            console.warn("Удаление из друзей...");
            setIsOpenFriend(false);
            ContextStructure.DeleteFriend(ContextStructure.phoneNumber, infoFriends[index].phone_number) // Надо доделать на сервере 
        }
    }

    // Принять друга (не работает) 
    const handleAcceptFriend = (event) => {
        event.stopPropagation();            // чтобы событие клика не проходило дальше и открывало модалку, останавливаем пропагинацию
        const index = event?.target?.id;
        if(index) {
            console.warn("Принятие заявки в друзья");
            setIsOpenFriend(false);
            ContextStructure.AcceptFriend(ContextStructure.phoneNumber, ContextStructure.inReqFriends[index].phoneNumber)
        }
    }

    // Отменить поступившую заявку в друзья (работает корректно)
    const handleRejectRequest = (event) => {
        event.stopPropagation();            // чтобы событие клика не проходило дальше и открывало модалку, останавливаем пропагинацию
        const index = event?.target?.id;
        if(index) {
            console.warn("Отклонение заявки в друзья");
            setIsOpenFriend(false);
            ContextStructure.RejectFriend(ContextStructure.inReqFriends[index].phoneNumber, ContextStructure.phoneNumber)
        }
    }

    return (
        <div id="container">
        <div id="label_welcome">Добро пожаловать, {ContextStructure.username}</div>
             <div id="listFriends">

                {/* Блок текущих друзей */}
                <div className="labelForOutRequest" style={{ marginTop: '3px' }}>Список друзей</div>
                <div className="divider"></div>
                {
                    infoFriends && infoFriends.length > 0 ? 
                        infoFriends.map((friend, index) => {
                            return (
                                <div key={index + "containerDiv"}>
                                    <div className="row" key={index + "row"}  id={"current_row" + index} onClick={handleOpenFriend}>
                                        <img className="avatar" src={friend.avatar} id={"current_avatar" + index}  key={index + "avatar"}></img>
                                        <div className="username" key={index + "username"} id={"current_username" + index}>{friend.username}</div>
                                    </div>
                                    <div className="divider" key={index + "divider"}></div>
                                </div>
                            )
                        })
                    :
                        <>
                            <div className="divider"></div>
                            <div className="labelForOutRequest">Пусто</div>
                        </>
                }
                {/* Блок исходящих запросов */}
                <div className="labelForOutRequest" style={{ marginTop: '15px' }}>Исходящие запросы</div>
                <div className="divider"></div>
                {
                    ContextStructure.outReqFriends && ContextStructure.outReqFriends.length > 0 ?
                        ContextStructure.outReqFriends.map((friend, index) => {
                            return (
                                <div key={index + "containerDiv"}>
                                    <div className="row" style={{opacity: '0.5'}}  id={"out_friend_row" + index} key={index + "row"} onClick={handleOpenFriend}>
                                        <img className="avatar" src={'../' + friend.avatar} key={index + "avatar"} id={"out_friend_avatar" + index} ></img>
                                        <div className="username" key={index + "username"} id={"out_friend_username" + index} style={{ width: 'calc(85% - 50px)'}}>{friend.username}</div>
                                        <div className="btnCancel" onClick={handleCancelRequest} id={index}><ClearIcon id={index} fontSize="small"/></div>
                                    </div>
                                    <div className="divider" key={index + "divider"}></div>
                                </div>
                            )
                        })
                    :
                        <div className="labelForOutRequest">Пусто</div>
                }

                {/* Блок входящих запросов */}
                <div className="labelForOutRequest" style={{ marginTop: '15px' }}>Входящие запросы</div>
                <div className="divider"></div>
                    {
                        ContextStructure.inReqFriends && ContextStructure.inReqFriends.length > 0 ?
                            ContextStructure.inReqFriends.map((friend, index) => {
                                return (
                                    <div key={index + "containerDiv"}>
                                        <div className="row" style={{opacity: '0.5'}}  id={"in_friend_row" + index} key={index + "row"} onClick={handleOpenFriend}>
                                            <img className="avatar" src={'../' + friend.avatar} key={index + "avatar"} id={"in_friend_avatar" + index} ></img>
                                            <div className="username" key={index + "username"} id={"in_friend_username" + index} style={{ width: 'calc(85% - 50px)'}}>{friend.username}</div>
                                            <div className="btnCancel" onClick={handleAcceptFriend} id={index}><CheckIcon id={index} fontSize="small"/></div>
                                            <div className="btnCancel" onClick={handleRejectRequest} id={index}><ClearIcon id={index} fontSize="small"/></div>
                                        </div>
                                        <div className="divider" key={index + "divider"}></div>
                                    </div>
                                )
                            })
                        :
                            <div className="labelForOutRequest">Пусто</div>
                    }

                </div>

            {/* Блок "Добавить друга" */}
             <div id="row_to_add_friend" onClick={handleAddFriend}>
                    <div id="img_to_add_friend"><AddIcon/></div>
                    <div id="label_to_add_friend">Добавить друга!</div>
            </div>

            {/* Модалка для добавления нового друга */}
            <Modal activeModal={activeModal} setActiveModal={setActiveModal}>
                <div id="container_modal">
                    <div id="title_modal">Добавить нового друга!</div>

                    <div className="wrapper_modal">
                        <div id="number_modal">Введите номер телефона:</div>
                        <input id="inputNumber_modal"></input>
                    </div>

                    <div className="wrapper_modal">
                        <div id="comment_modal">Добавить комментарий (по желанию): </div>
                        <textarea id="inputComment_modal"></textarea>
                    </div>

                    <button id="btn_modal" onClick={sendFriendRequest}>Отправить запрос дружбы!</button>
                </div>
            </Modal>

            {/* Модалка открытия друга */}
            <Modal activeModal={isOpenFriend} setActiveModal={setIsOpenFriend}>
               {
                typeFriend == "current" ?
                    <div className="container_open_friend">
                        <img src={infoFriends[indexFriend]?.avatar} className="avatar_open_friend"></img>
                        <div className="username_open_friend">Имя: {infoFriends[indexFriend]?.username}</div>
                        <div className="phoneNumber_open_friend">Номер телефона: {infoFriends[indexFriend]?.phone_number}</div>
                        <div style={{width: '100%', display: 'flex', justifyContent: 'space-around'}}>
                            <button className="sendMsg_open_friend">Написать сообщение</button>
                            <button className="sendMsg_open_friend" onClick={handleDeleteFriend} id={indexFriend}>Удалить из друзей</button>
                        </div>
                    </div>
                :
                    typeFriend == "out" ?
                        <div className="container_open_friend">
                            <img src={"../" + ContextStructure.outReqFriends[indexFriend]?.avatar} className="avatar_open_friend"></img>
                            <div className="username_open_friend">Имя: {ContextStructure.outReqFriends[indexFriend]?.username}</div>
                            <div className="phoneNumber_open_friend"> Номер телефона: {ContextStructure.outReqFriends[indexFriend]?.phoneNumber}</div>
                            <div className="comment_open_friend">Ваше сообщение: {ContextStructure.outReqFriends[indexFriend]?.comment}</div>
                        </div>
                    :
                     typeFriend == "in" ?
                        <div className="container_open_friend">
                            <img src={"../" + ContextStructure.inReqFriends[indexFriend]?.avatar} className="avatar_open_friend"></img>
                            <div className="username_open_friend">Имя: {ContextStructure.inReqFriends[indexFriend]?.username}</div>
                            <div className="phoneNumber_open_friend"> Номер телефона: {ContextStructure.inReqFriends[indexFriend]?.phoneNumber}</div>
                            <div className="comment_open_friend">Входящее сообщение: {ContextStructure.inReqFriends[indexFriend]?.comment}</div>
                        </div>
                    : null
               }
            </Modal>

            <div id="viewDiv" ></div>
        </div>
    )
}

export default Main;