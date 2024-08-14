import {useState, useEffect} from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import "./index.css"

const Project = (props)=>{
    const [adminData, setAdminData] = useState([])
    const [projectname, setProjectName] = useState('')
    
    const {id} = useParams()

    useEffect(()=>{
        function initiate(){
            axios.get(`http://localhost:8000/projectItems/${id}`).then((res)=>{
                const allDatas = res.data
                console.log(res)
                setAdminData(allDatas)
            })
        }
        initiate()
    },[])

    const projectControl=e=>{
        setProjectName(e.target.value)
    }

    const createProject=projectid=>{
        axios.post(`http://localhost:8000/createproject/${projectid}`, {projectname}).then((res)=>{
            window.location.reload()
        })
    }
   const projectDelete= (id)=>{
    axios.get(`http://localhost:8000/dashboard/projectdelete/${id}`).then((res)=>{
      console.log(res)
      window.location.reload()
   })
  }

    return (
        <div className="dash-container">
            <h2 className='task-head'>PROJECTS</h2>
            <input type='text' onChange={projectControl} value={projectname}/>
                    <button className='createprojects' type='button' onClick={()=>{createProject(id)}}>create</button>
                <ul className="user-unorder">
                    
                {adminData.map(each=>(
                    <li className="user-list-item" key={each.project_id}>
                    <Link to={`/task/${each.project_id}`} className="user-task">{each.project_name}</Link>
                    <button className="user-task-button" onClick={()=>projectDelete(each.project_id)}>delete</button>
                </li>
                )
                )}
                </ul>
        </div>
    )
}

export default Project