import logo from '../logo.svg';
import '../assets/styles/App.css';
import { useClientHook } from '../client.hook';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import LoginIcon from '@mui/icons-material/Login';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { GenContext } from "../contexts/GeneralContext";

const AuthPage = () => {
  const {tryAuth, isUserExist, isSuccessAuth, doEntry, doRegister} = useClientHook();
  const ContextStructure = useContext(GenContext);
  const [isValidPass, setValidPass] = useState(false);
  const [isPassword, setIsPassword] = useState(true);
  const navigate = useNavigate();
  
  console.dir(ContextStructure);

  useEffect(() => {
    if(isSuccessAuth) {
      navigate('/main');
      ContextStructure.setPhoneNumber(document.getElementById('phoneInput').value);
      console.dir("Go to main (maps) page")
    }
  }, [isSuccessAuth, navigate]);

  useEffect(() => {
    if(isUserExist != null)
      setValidPass(true);
  }, isUserExist);

  // Запросим, есть ли такой пользователь
  const handleAuth = () => {
    const numberPhone = document.getElementById('phoneInput').value;
    tryAuth(numberPhone);
  };

  const handleEntry = () => {
    const numberPhone = document.getElementById('phoneInput').value;
    const password = document.getElementById('inputPassEnter').value; 
    doEntry(numberPhone, password);
  };

  const handleRegister = () => {
    const numberPhone = document.getElementById('phoneInput').value;
    const password = document.getElementById('inputPassRegister').value; 
    const username = document.getElementById('inputUserName').value;
    doRegister(username, numberPhone, password);
  };

  const changeTypeInput = () => {
    if(isPassword)
      setIsPassword(false);
    else 
      setIsPassword(true);
  }

  const matchPass = () => {

  }
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div id="main_container_auth">
          <p className="text_">
          { isUserExist ? "Авторизация" : "Регистрация"}
          </p>
          <label htmlFor="phoneInput" className="text_">Введите номер телефона</label>
          <div className="rowInputNumber">
            <input id="phoneInput" type="text" className="input_"/>
            <button id="tryEnter" onClick={handleAuth}><ArrowForwardIosIcon/></button>
          </div>
          {
            isValidPass ? 
              isUserExist ?
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignContent: 'center'}}>
                  <label htmlFor="inputPassEnter" className="text_" style={{marginTop: '25px'}}>Введите пароль</label>
                  <div className="rowInputNumber">
                    <input id="inputPassEnter" type={isPassword ? "password" : "text"} className="input_"></input>
                    <button className="getter-setter-visibility" style={{ right: '11%', marginTop: '5px' }} onClick={changeTypeInput}>
                      { isPassword ? <VisibilityIcon fontSize ="25px"/> : <VisibilityOffIcon fontSize ="25px"/> }
                    </button>
                    <button id="tryEnter" onClick={handleEntry} className="input_"><LoginIcon/></button>
                  </div>
                </div> : 
                <div id="container_auth">
                  <div id="wrapper_auth_username">
                    <label htmlFor="inputUserName" className="text_"  style={{width: '35%', marginRight: '15px'}}>Придумайте имя пользователя</label>
                    <input id="inputUserName" type="text" className="input_" style={{width: '25%'}}></input>
                  </div>
                  <div id="wrapper_auth_pass">
                    <label htmlFor="inputPassRegister" className="text_" style={{width: '35%', marginRight: '15px'}}>Придумайте пароль </label>
                    <input id="inputPassRegister" type={isPassword ? "password" : "text"} className="input_" style={{width: '35%'}}></input>
                    <button className="getter-setter-visibility" style={{ marginBottom: '5px' }} onClick={changeTypeInput}>
                      { isPassword ? <VisibilityIcon fontSize ="25px"/> : <VisibilityOffIcon fontSize ="25px"/> }
                    </button>
                  </div>

                  <div id="wrapper_auth_pass">
                    <label htmlFor="inputPassRegister" className="text_" style={{width: '35%', marginRight: '15px'}}>Подтвердите пароль</label>
                    <input id="inputPassRegister" type={isPassword ? "password" : "text"} className="input_" style={{width: '35%'}} onChange={matchPass}></input>
                    <button className="getter-setter-visibility" style={{ marginBottom: '5px' }} onClick={changeTypeInput}>
                      { isPassword ? <VisibilityIcon fontSize ="25px"/> : <VisibilityOffIcon fontSize ="25px"/> }
                    </button>
                  </div>

                  <button id="tryEnter" style={{marginTop: '25px'}} onClick={handleRegister}><LoginIcon/></button>
                </div> 
                : null

          }
        </div>
      </header>
    </div>
  );
}

export default AuthPage;
