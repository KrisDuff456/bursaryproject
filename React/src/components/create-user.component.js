import React, { Component } from 'react';
import axios from 'axios';
import CryptoJS from "react-native-crypto-js";
import { codes } from "../secrets/secrets.js";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export default class CreateUser extends Component {
    
    constructor(props) {
        super(props);
        this.onChangeUserEmail = this.onChangeUserEmail.bind(this);
        this.onChangeUserPassword = this.onChangeUserPassword.bind(this);
        this.changeUserRole = this.changeUserRole.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.toggle = this.toggle.bind(this);
        this.state = {
            user_email: '',
            user_password: '',
            user_role: 'Role',
            dropdownOpen: false
        }
    }

    toggle() {
        this.setState(prevState => ({
          dropdownOpen: !prevState.dropdownOpen
        }));
      }

    onChangeUserEmail(e) {
        this.setState({
            user_email: e.target.value
        });
    }
    
    onChangeUserPassword(e) {
        this.setState({
            user_password: e.target.value
        });
    }

    changeUserRole(e) {
        this.setState({
            user_role: e.currentTarget.textContent
        });
    }
    
    onSubmit(e) {
        e.preventDefault();
        
        console.log(`Form submitted:`);
        console.log(`User Email: ${this.state.user_email}`);
        console.log(`User role: ${this.state.user_role}`)
        
        var email = CryptoJS.AES.encrypt(this.state.user_email, codes.staff, {iv: codes.iv});
        var pass  = CryptoJS.AES.encrypt(Math.random().toString(36).slice(-8), codes.staffPass);

        var newUser = {
            email: email.toString(),
            password: pass.toString(),
            role: this.state.user_role.toLowerCase()
        };
        
        console.log(newUser)
        
        axios.post('http://localhost:4000/admin/addUser', newUser)
         .then( (response) => {axios.post('http://localhost:4000/admin/send-email-staff', {email: email.toString()})
                           .then( (response) => console.log(response.data))});        
        
        this.props.history.push('/admin');
        window.location.reload();
    }
    
   render() {
        return (
            <div style={{marginLeft: 100, marginRight: 100}}>
                <h3>Add User</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Email: </label>
                        <input 
                                type="text" 
                                className="form-control"
                                value={this.state.user_email}
                                onChange={this.onChangeUserEmail}
                                />
                    </div>
                    <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                        <DropdownToggle caret>
                        {this.state.user_role}
                        </DropdownToggle>
                        <DropdownMenu>
                        <DropdownItem>
                            <div onClick={this.changeUserRole}>
                                Recruiter
                            </div>
                        </DropdownItem>
                        <DropdownItem>
                            <div onClick={this.changeUserRole}>
                                Finance
                            </div>
                        </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    {/* <div className="form-group">
                        <label>Role: </label>
                        <input 
                                type="text" 
                                className="form-control"
                                value={this.state.user_role}
                                onChange={this.onChangeUserRole}
                                />
                    </div> */}

                    <div className="form-group">
                        <input type="submit" value="Add User" className="btn btn-primary" />
                    </div>
                </form>
            </div>
        )
    }
}