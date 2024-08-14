import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './components/login'
import Dashboard from './components/dashboard'
import Project from './components/project';
import Task from './components/task';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={Login}/>
        <Route path='/dashboard' Component={Dashboard}/>
        <Route path='/user/project/:id' Component={Project}/>
        <Route path="/task/:id" Component={Task}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
