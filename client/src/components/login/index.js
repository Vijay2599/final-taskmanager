import state, {useState} from "react"
import axios from "axios"
import Cookies from "js-cookie"
import {useNavigate} from 'react-router-dom'

import './index.css'

const Login=()=>{
    const [formValue, setFormValue] = useState({username:'', password:'', type:''})
    const [loginValues, setLoginValues] = useState({username:'', password:''})
    const history=useNavigate()
    const handleChange = e=>{
        setFormValue({...formValue, [e.target.name]:e.target.value})
    }

    const logHandleChange = e=>{
        setLoginValues({...loginValues, [e.target.name]:e.target.value})
    }

    const registerSubmit= async (e) =>{
        e.preventDefault()
        await axios.post('http://localhost:8000/register', formValue).then((res)=>{
            
            alert(res.data)
            setFormValue({username:'', password:'', type:''})
          })
    }

    const loginSubmit=async (e)=>{
        e.preventDefault()
        await axios.post('http://localhost:8000/login', loginValues).then((res)=>{
            console.log(res)
            const token = res.data.jwtToken
            if (token){
                alert("verfied")
                console.log(token)
                setLoginValues({username:'', password:''})
                Cookies.set("jwt_token", token, {expires:30})
                history('/dashboard')
            }else{
                alert('not back token')
            }
          })
    }
    return (
        <div className="log-background">
            <div className="inner-container">
                <form onSubmit={registerSubmit} className="registerform">
                    <h1>Register</h1>
                    <div className="input-group">
                        <label className="name">USER NAME</label>
                        <input type="text" className="input" name="username" value={formValue.username} onChange={handleChange}/>
                    </div>
                    <div className="input-group">
                        <label className="name">PASSWORD</label>
                        <input type="password" name="password" className="input" value={formValue.password} onChange={handleChange}/>
                    </div>
                    <div className="input-group">
                        <label className="name">Type</label>
                        <select className="input" name="type" value={formValue.type} onChange={handleChange}>
                            <option name="option" value='admin'>Admin</option>
                            <option name="option" value='member'>Member</option>
                        </select>
                    </div>
                    <button className="submit" type="submit">Register</button>
                </form>
                <form  className="loginform" onSubmit={loginSubmit}>
                    <h1>Login</h1>
                    <div className="input-group">
                        <label className="name">USER NAME</label>
                        <input type="text" className="input" name="username" value={loginValues.loginName} onChange={logHandleChange}/>
                    </div>
                    <div className="input-group">
                        <label className="name">PASSWORD</label>
                        <input type="password" name="password" className="input" value={loginValues.loginPassword} onChange={logHandleChange}/>
                    </div>
                    <button className="submit" type="submit">Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login