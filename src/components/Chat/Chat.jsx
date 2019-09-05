import React from 'react';
import io from 'socket.io-client';
import copy from 'clipboard-copy';
import { Grid,Button, TextField } from '@material-ui/core';
class Chat extends React.Component {
  socket = null;

  constructor(props) {
    super(props);
    const key = new URLSearchParams(window.location.search).get('key');
    this.state = { key, loading: !Boolean(key), messages: [], users: [], time: new Date() };
  }
  componentDidMount() {
    if (!this.state.key) {
      fetch('http://localhost:8080/enter', { headers: { 'Content-Type': 'application/json' } }).then((res) => {
        return res.json();
      }).then((body) => {
        this.setState({ key: body.key, loading: false });
        this.initConnection();
      })
    } else {
      this.initConnection();
    }
  }
  render() {
    return (
      <Grid container>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          {/* room's link and users */}
          <Grid item xs="4"> 
          <h1>Link for invite to room:</h1><br></br>
            {`${window.location.origin}?key=${this.state.key}`}
            <Button variant="outlined" onClick={() => copy(`${window.location.origin}?key=${this.state.key}`)}>
              Copy
            </Button>
            <br></br><h1>Users in the room:</h1>
            <ul>
             {
              this.state.users.map((user, index) => {
                return <li key={index}>{user}</li>
               })
             }
            </ul>
          </Grid>
          {/*Chat*/}
          <Grid item xs="6">
            <div className="messages" style={{height:"500px", overflowY: "scroll"}}>
            <ul>
              {
                this.state.messages.map((message, index) => {
                  return <li key={index}>{this.state.time.getHours()}:{this.state.time.getMinutes()} {message.user}:<br></br>
                  {message.message}</li>
                })
              }
            </ul>
            </div>
            <TextField
                className="{style.input}"
                variant="outlined"
                label="Message"
                onKeyPress={this.sendMessage}
                type='text'
                inputRef={(node) => { this.input = node }}
            />
            <Button variant="outlined"
                className="{style.button}"
                onClick={this.sendMessage}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Grid>
      </Grid>
    )
  }
  initConnection = () => {
    this.socket = io.connect('localhost:8080', {
      query: {
        user: this.props.user,
        room: this.state.key,
      },
    });

    this.socket.emit('GET_MESSAGES', ({ messages }) => {
      this.setState({ messages });
    });

    this.socket.on('NEW_MESSAGES', ({ messages }) => {
      this.setState({ messages });
    });

    this.socket.on('USERS', ({ users }) => {
      this.setState({ users });
    });
  }
  sendMessage = (e) => {
    if (!this.input || !this.input.value) {
      return;
    }

    if (e.key === 'Enter' || e.type === 'click') {
      this.socket.emit('SEND_MESSAGE', {
        message: this.input.value
      });
      this.input.value = '';
    }
  }
}
export default Chat;