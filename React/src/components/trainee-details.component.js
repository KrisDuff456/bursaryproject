import React, { Component } from 'react';
import axios from 'axios';
import CryptoJS from "react-native-crypto-js";

export default class TraineeDetails extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
			id: '',
			trainee_fname: '',
            trainee_lname: '',
            trainee_email: '',
            trainee_account_no: '',
            trainee_sort_code: '',
            trainee_approved: false,
        }
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        axios.get('http://localhost:4000/trainee/'+this.props.match.params.id)
            .then(response => {
                console.log(response.data);
                console.log(response.data.trainee_account_no);
                if(response.data.trainee_account_no != null && response.data.trainee_sort_code != null){
                    var trainee_account_no = CryptoJS.AES.decrypt(response.data.trainee_account_no, '3FJSei8zPx');
                    var trainee_sort_code = CryptoJS.AES.decrypt(response.data.trainee_sort_code, '3FJSei8zPx');
                    this.setState({
                        trainee_account_no: trainee_account_no.toString(CryptoJS.enc.Utf8),
                        trainee_sort_code: trainee_sort_code.toString(CryptoJS.enc.Utf8),
                    }) 
                }
                var trainee_fname  = CryptoJS.AES.decrypt(response.data.trainee_fname, '3FJSei8zPx');
                var trainee_lname  = CryptoJS.AES.decrypt(response.data.trainee_lname, '3FJSei8zPx');
                var trainee_email  = CryptoJS.AES.decrypt(response.data.trainee_email, '3FJSei8zPx');
                this.setState({
                    trainee_fname: trainee_fname.toString(CryptoJS.enc.Utf8),
                    trainee_lname: trainee_lname.toString(CryptoJS.enc.Utf8),
                    trainee_email: trainee_email.toString(CryptoJS.enc.Utf8),
                }) 
                
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    onSubmit(e) {

        const obj = {
			trainee_fname: this.state.trainee_fname,
            trainee_lname: this.state.trainee_lname,
            trainee_email: this.state.trainee_email,
            trainee_password: this.state.trainee_password,
            trainee_account_no: this.state.trainee_account_no,
            trainee_sort_code: this.state.trainee_sort_code,
            trainee_approved: this.state.trainee_approved,
        };
        console.log(obj);
        this.props.history.push('/edit/'+this.props.match.params.id);
    }

render() {
        return (
            <div>
                <h3>Trainee Details</h3>
                <table onSubmit={this.onSubmit} className="table table-striped" style={{ marginTop: 20 }} >
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Account Number</th>
                            <th>Account Sort-Code</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{this.state.trainee_fname}</td>
                            <td>{this.state.trainee_lname}</td>
                            <td>{this.state.trainee_email}</td>
                            <td>{this.state.trainee_account_no}</td>
                            <td>{this.state.trainee_sort_code}</td>
                            <td><form><input type="submit" value="Edit" className="btn btn-primary" /></form></td>
                        </tr>
                    </tbody>
                </table>
            </div>

        )
    }
}