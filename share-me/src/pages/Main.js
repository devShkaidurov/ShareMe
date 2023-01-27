import '../assets/styles/main.css';
import myIconImage from '../assets/images/my-icon.png';
import myIconShadow from '../assets/images/my-icon-shadow.png';
// import myAva from '../assets/images/avatars/avatar_egor.jpg';
import { GenContext } from "../contexts/GeneralContext";
import { useContext, useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import Modal from '../libs/Modal/modal_display.jsx';

const Main = () => {
    const ContextStructure = useContext(GenContext);
    const myIcon = window.L.icon({
        iconUrl: myIconImage,
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
        shadowUrl: myIconShadow,
        shadowSize: [68, 95],
        shadowAnchor: [22, 94]
    });
    let map;
    const [infoFriends, setInfoEFriends] = useState([]);
    const [activeModal, setActiveModal] = useState(false);
    const [isOpenFriend, setIsOpenFriend] = useState(false);
    const [typeFriend, setTypeFriend] = useState();      // for modal in open friend
    const [indexFriend, setIndexFriend] = useState();    // for modal in open friend

    useEffect(() => {
        ContextStructure.getFriends(ContextStructure.phoneNumber);
    }, []);

    useEffect(() => {
        console.dir(ContextStructure.infoAboutFriend);
        if(ContextStructure.infoAboutFriend && ContextStructure.infoAboutFriend.length > 0) {
            let mapOptions = {
                center:[53.228430415931896, 50.22644302684405],
                zoom: 12,
                keyboard: false
            };
        
            map = new window.L.map('map' , mapOptions);
            let layer = new window.L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Share me maps',
                minZoom: 3,
                maxZoom: 15
            });
            map.addLayer(layer);

            const tempArr = [];
            ContextStructure.infoAboutFriend.forEach(friend => {
                const currIcon = window.L.icon({
                    iconUrl: friend.avatar,
                    iconSize: [46, 46],
                    iconAnchor: [21, 46],
                    popupAnchor: [0, -46],
                    shadowUrl: myIconShadow,
                    shadowSize: [35, 46],
                    shadowAnchor: [10, 46],
                    className: 'style_for_icon'
                });
                let marker1 = new window.L.Marker([friend.lat, friend.lon], {icon: currIcon});
                marker1.addTo(map);
                tempArr.push(friend);
            });

            setInfoEFriends(tempArr);

        } else if(ContextStructure.infoAboutFriend && ContextStructure.infoAboutFriend.length == 0) {
            let mapOptions = {
                center:[53.228430415931896, 50.22644302684405],
                zoom: 12,
                keyboard: false
            };
        
            let map = new window.L.map('map' , mapOptions);
            let layer = new window.L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
            map.addLayer(layer);
        };
    }, [ContextStructure.infoAboutFriend]);


    const handleAddFriend = () => {
        setActiveModal(true);
    }

    const sendFriendRequest = () => {
        const friendNumber = document.getElementById('inputNumber_modal').value;
        const comment = document.getElementById('inputComment_modal').value;
        ContextStructure.sendFriendRequest(ContextStructure.phoneNumber, friendNumber, comment);
        setActiveModal(false);
        document.getElementById('inputNumber_modal').value = "";
        document.getElementById('inputComment_modal').value = "";
    }

    const handleOpenFriend = (e) => {
        setIndexFriend(e.target.id[e.target.id.length - 1]);
        setTypeFriend(e.target.id.match("current") ? "current" : e.target.id.match("in") ? "in" : "out");
        setIsOpenFriend(true);
    }

    useEffect(() => {
        console.dir(ContextStructure.outReqFriends);
    }, [ContextStructure.outReqFriends]);

 
    return (
        <div id="container">
        <div id="label_welcome">Добро пожаловать, {ContextStructure.username}</div>
             <div id="listFriends">
                <div className="labelForOutRequest" style={{ marginTop: '3px' }}>Список друзей</div>
                <div className="divider"></div>
                {
                    infoFriends && infoFriends.length > 0 ? 
                        infoFriends.map((friend, index) => {
                            return (
                                <div key={index + "containerDiv"}>
                                    <div className="row" key={index + "row"}  id={"current_row" + index} onClick={handleOpenFriend}>
                                        <img className="avatar" src={friend.avatar} id={"current_avatar" + index}  key={index + "avatar"}></img>
                                        <div className="username" key={index + "username"} id={"current_username" + index} >{friend.username}</div>
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
                <div className="labelForOutRequest" style={{ marginTop: '15px' }}>Исходящие запросы</div>
                <div className="divider"></div>
                {
                    ContextStructure.outReqFriends.length > 0 ?
                        ContextStructure.outReqFriends.map((friend, index) => {
                            return (
                                <div key={index + "containerDiv"}>
                                    <div className="row" style={{opacity: '0.5'}}  id={"out_friend_row" + index} key={index + "row"} onClick={handleOpenFriend}>
                                        <img className="avatar" src={friend.avatarFriend} key={index + "avatar"} id={"out_friend_avatar" + index} ></img>
                                        <div className="username" key={index + "username"} id={"out_friend_username" + index} >{friend.usernameFriend}</div>
                                    </div>
                                    <div className="divider" key={index + "divider"}></div>
                                </div>
                            )
                        })
                    :
                        <div className="labelForOutRequest">Пусто</div>
                }

             </div>

             <div id="row_to_add_friend" onClick={handleAddFriend}>
                    <div id="img_to_add_friend"><AddIcon/></div>
                    <div id="label_to_add_friend">Добавить друга!</div>
            </div>
            {/* Add a new friend MODAL */}
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

            {/* open friend MODAL */}
            <Modal activeModal={isOpenFriend} setActiveModal={setIsOpenFriend}>
               {
                typeFriend == "current" ?
                    <div className="container_open_friend">
                        <img src={infoFriends[indexFriend].avatar} className="avatar_open_friend"></img>
                        <div className="username_open_friend">Имя: {infoFriends[indexFriend].username}</div>
                        <div className="phoneNumber_open_friend">Номер телефона: {infoFriends[indexFriend].phone_number}</div>
                        <div style={{width: '100%', display: 'flex', justifyContent: 'space-around'}}>
                            <button className="sendMsg_open_friend">Написать сообщение</button>
                            <button className="sendMsg_open_friend">Удалить из друзей</button>
                        </div>
                    </div>
                :
                    typeFriend == "out" ?
                        <div className="container_open_friend">
                            <img src={ContextStructure.outReqFriends[indexFriend].avatarFriend} className="avatar_open_friend"></img>
                            <div className="username_open_friend">Имя: {ContextStructure.outReqFriends[indexFriend].usernameFriend}</div>
                            <div className="phoneNumber_open_friend"> Номер телефона: {ContextStructure.outReqFriends[indexFriend].numberFriend}</div>
                            <div className="comment_open_friend">Ваше сообщение: {ContextStructure.outReqFriends[indexFriend].comment}</div>
                        </div>
                    :
                        <div>Входящая заявка</div>
               }
            </Modal>

            <div id="map"></div>
        </div>
    )
}

export default Main;