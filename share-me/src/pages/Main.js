import '../assets/styles/main.css';
import myIconImage from '../assets/images/my-icon.png';
import myIconShadow from '../assets/images/my-icon-shadow.png';
import { useClientHook } from '../client.hook';
import { GenContext } from "../contexts/GeneralContext";
import { useContext, useEffect } from "react";
import { useLocation } from 'react-router-dom';

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
            let layer = new window.L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
            map.addLayer(layer);
        
            let marker = new window.L.Marker([51.958, 9.141], {icon: myIcon});
            marker.addTo(map);

            ContextStructure.infoAboutFriend.forEach(friend => {
                let marker1 = new window.L.Marker([friend.lat, friend.lon], {icon: myIcon});
                marker1.addTo(map);
            });
        } else if(ContextStructure.infoAboutFriend && ContextStructure.infoAboutFriend.length == 0) {
            console.warn("creating maps");
            let mapOptions = {
                center:[53.228430415931896, 50.22644302684405],
                zoom: 12,
                keyboard: false
            };
        
            let map = new window.L.map('map' , mapOptions);
            let layer = new window.L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
            map.addLayer(layer);
        }
            
    }, [ContextStructure.infoAboutFriend])

    return (
        <div id="container">
             <div id="map"></div>
        </div>
    )
}

export default Main;