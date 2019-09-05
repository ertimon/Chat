import React from 'react';
import style from './Login.module.css';
import Chat from '../Chat/Chat';
class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      isFormVisible: true,
      isInputEmpty: false,
      userName: null,
    }
  }
  login = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const name = this.nameInput.value;
      this.setState(name ? { isFormVisible: false } : { isInputEmpty: true });
      this.setState({ userName: name });
    }
  }
  render() {
    const { isFormVisible, isInputEmpty, userName } = this.state;
    return (
      <div>
        {isFormVisible
          ? <div className={style.login}>
            <span className={style.header}>Для входа в чат введите имя</span>
            <input
              onKeyPress={this.login}
              className={style.input}
              placeholder='Имя'
              type="text"
              ref={(node) => { this.nameInput = node }}
            />
            <button
              className={style.button}
              onClick={this.login}>
              Отправить
            </button>
            {isInputEmpty
              ? <span className={style.error}>Вы забыли ввести имя</span>
              : null
            }
          </div>
          // : null
          : <Chat user={userName} />
        }
      </div>
    )
  }
}
export default Login;