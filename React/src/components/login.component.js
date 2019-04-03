import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import axios from 'axios';


export default class Login extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
          uname: '',
          psw: '',
        };
      }

    handleUsername = event => {
        this.setState({
            uname: event.target.value
        });
    }

    handlePassword = event => {
        this.setState({
            psw: event.target.value
        })
    }
    
    onSubmit = event => {
        event.preventDefault();
        const user = {
            username: this.state.uname,
            password: this.state.psw
        };
        axios.post('http://localhost:4000/trainee/login', user)
            .then(function(res){
                console.log(res);
                console.log(res.data);
                if(res.data.result === true ){
                    console.log('Successful, now redirecting');
                    document.location.href = 'http://localhost:3000/';
                }
                else{
                    console.log('Unsuccessful Login attempt');
                    
                }
            })
            .catch(error => {
                console.log(error.response)
            });
    }
    
    
    render() {
        return (
            <div className="Login">
                    <form onSubmit={this.onSubmit}>

                        <label className="uname"><b>Username</b></label>
                        <input type="text" placeholder="Enter Username" name="uname" onChange={this.handleUsername} required/>

                        <label className="psw"><b>Password</b></label>
                        <input type="password" placeholder="Enter Password" name="psw" onChange={this.handlePassword} required/>
                        

                        <input type="submit" value="Login"/>
                    </form>
                    
            </div>
        )
    }
}