import logo from '../logo.svg';
import '../assets/styles/App.css';
import { useClientHook } from '../client.hook';
import { useEffect, useState} from 'react';
import { useNavigate } from 'react-router';

const AuthPage = () => {
  const {tryAuth, isUserExist, isSuccessAuth, doEntry, doRegister} = useClientHook();
  const [isValidPass, setValidPass] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if(isSuccessAuth)
      navigate('/main');
  }, [isSuccessAuth, navigate]);



  const handleAuth = () => {
    // Скроем кнопку для красоты 
    const button = document.getElementById('tryEnter');
    button.style.display = 'none';

    // Запросим, есть ли такой пользователь
    const numberPhone = document.getElementById('phoneInput').value;
    tryAuth(numberPhone);
    setValidPass(true);
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

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
         Авторизация
        </p>
        <label for="phoneInput">Введите номер телефона</label>
        <input id="phoneInput" type="text"/><br/>

        <button id="tryEnter" onClick={handleAuth}>Проверить наличие пользователя</button>
        {
          isValidPass ? 
            isUserExist ?
              <div>
                <label for="inputPassEnter">Ввести пароль</label>
                <input id="inputPassEnter" type="password"></input><br/>
                <button id="tryEnter" onClick={handleEntry}>Авторизироваться</button>
              </div> : 
              <div>
                <label for="inputUserName">Придумайте имя пользователя</label>
                <input id="inputUserName" type="text"></input><br/>

                <label for="inputPassRegister">Придумайте пароль</label>
                <input id="inputPassRegister" type="password"></input><br/>
                <button id="tryEnter" onClick={handleRegister}>Зарегистрироваться</button>
              </div> 
              : null

        }
      </header>
    </div>
  );
}

export default AuthPage;
