import '../assets/styles/main.css';

const Main = () => {

    setTimeout(() => {
        let mapOptions = {
            center:[51.958, 9.141],
            zoom:10,
            keyboard: false
        }
    
    
        let map = new window.L.map('map' , mapOptions);
    
        let layer = new window.L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        map.addLayer(layer);
        
        const myIcon = window.L.icon({
            iconUrl: '../assets/images/my-icon.png',
            iconSize: [38, 95],
            iconAnchor: [22, 94],
            popupAnchor: [-3, -76],
            shadowUrl: '../assets/images/my-icon-shadow.png',
            shadowSize: [68, 95],
            shadowAnchor: [22, 94]
        });
    
        let marker = new window.L.Marker([51.958, 9.141], {icon: myIcon});
        marker.addTo(map);
        }, 1000);


    return (
        <div id="container">
             <h1>Welcome to ShareMe!</h1> 
             <div id="map"></div>
        </div>
    )
}

export default Main;