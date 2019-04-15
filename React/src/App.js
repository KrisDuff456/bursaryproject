import React, { Component } from 'react';
import './App.css';
import Nav from './Nav.js'
import { BrowserRouter as Router, Route} from "react-router-dom";

import CreateTrainee from "./components/create-trainee.component";
import EditTrainee from "./components/edit-trainee.component";
import ListTrainee from "./components/list-trainee.component";

import ChangePassword from "./components/change-password-trainee.component";
import TraineeDetails from "./components/trainee-details.component";
import Login from "./components/login.component"
import Tab from "./tab"

class App extends Component {
  render() {
    return (
      <Router>    
        <div className="App">
          <Nav/>
          <h2>QA Bursary</h2>
        </div>
        <Route path="/edit/:id" component={EditTrainee} />
        <Route path="/create" component={CreateTrainee} />
        <Route path="/changePassword/:token" component={ChangePassword} />
        <Route path="/trainee-details/:id" component={TraineeDetails} />
        <Route path="/login" component={Login} />
        <Tab />
      </Router>    
    );
  }
}

export default App;
