import state, {useState, useEffect} from "react"
import {useNavigate} from 'react-router-dom'
import axios from "axios"
import Cookies from "js-cookie"
import "./index.css"

const Dashboard = ()=>{
    const [adminData, setAdminData] = useState([])
    const navigate = useNavigate()


    useEffect(()=>{
        async function initialFunction (){
            const token = Cookies.get("jwt_token")
             await axios.get('http://localhost:8000/dashboardview', {headers:{'authorization':`Bearer ${token}`}}).then((res)=>{
                const allDatas = res.data
                console.log(res)
                setAdminData(allDatas)
            })
        }

        initialFunction()
    } , [])

    const userNavigation=(id)=>{
        navigate(`/user/project/${id}`)
    }

    const adminDelete=(id)=>{
      axios.get(`http://localhost:8000/dashboard/singleuserdelete/${id}`).then((res)=>{
        console.log(res)
        window.location.reload()
     })
    }

    return (
        <div className="dash-container">
            <h2 className="task-head">USERS</h2>
            
                <ul className="user-unorder">
                {adminData && adminData.map(each=>(
                    <li className="user-list-item" key={each.user_id}>
                        <button onClick={()=>{userNavigation(each.user_id)}} className="user-task">{each.user_name}</button>
                        <button onClick={()=>{adminDelete(each.user_id)}} className="user-task-button">delete</button>
                    </li>
                )
                )}
                </ul>
        </div>
    )

}

export default Dashboard