import logo from './logo.svg';
import './App.css';
import {HashRouter,Switch,Route} from 'react-router-dom';
import Home from "./routes/home";
import Admin from './routes/admin';
import Hospital from './routes/hospital'
import Patient from './routes/Patient';
import Signup from './routes/siignUp';
import { Component } from 'react';
import Embed from './routes/embed'
class App extends Component {
  render(){
  return (
    <HashRouter>
    <Switch>
      <Route path="/"exact>
        <Home/>
      </Route>
      <Route path="/admin" exact>
        <Admin/>
      </Route>
      <Route path="/hospital">
        <Hospital/>
      </Route>
      <Route path="/patient">
      <Patient/>
    </Route>

    <Route path="/signUp">
    <Signup/>
  </Route>
  <Route path="/hospital" exact component={Hospital}></Route>
  <Route path="/patient" exact component={Patient}></Route>
  <Route path="/embed/:id" exact render={(props) => <Embed {...props}/>}></Route>
    </Switch>
  </HashRouter>
  );
}
}

export default App;
