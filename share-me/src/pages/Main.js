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
                minZoom: 7,
                maxZoom: 15
            });
            map.addLayer(layer);
        
            let marker = new window.L.Marker([51.958, 9.141], {icon: myIcon});
            marker.addTo(map);

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
    }

    return (
        <div id="container">
             <div id="listFriends">
                {
                    infoFriends.length > 0 ? 
                    infoFriends.map((friend, index) => {
                        return (
                            <div key={index + "containerDiv"}>
                                <div className="row" key={index + "row"}>
                                    <img className="avatar" src={friend.avatar} key={index + "avatar"}></img>
                                    <div className="username" key={index + "username"}>{friend.username}</div>
                                </div>
                                <div className="divider" key={index + "divider"}></div>
                            </div>
                        )
                    })
                    :
                        null
                }
             </div>

             <div id="row_to_add_friend" onClick={handleAddFriend}>
                    <div id="img_to_add_friend"><AddIcon/></div>
                    <div id="label_to_add_friend">Добавить друга!</div>
            </div>
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
            <div id="map"></div>
        </div>
    )
}

export default Main;