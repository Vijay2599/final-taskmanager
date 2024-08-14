import {useState, useEffect} from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import './index.css'

const Task = (props)=>{
    const [adminData, setAdminData] = useState([])
    const [projectname, setProjectName] = useState({taskname:'', status:'TO DO'})
    
    const {id} = useParams()

    useEffect(()=>{
        function initiate(){
            axios.get(`http://localhost:8000/task/${id}`).then((res)=>{
                const allDatas = res.data
                console.log(res)
                setAdminData(allDatas)
            })
        }
        initiate()
    },[])

    const taskControl=e=>{
        setProjectName({...projectname, [e.target.name]:e.target.value})
    }

    const createtask=projectid=>{
        axios.post(`http://localhost:8000/createtask/${projectid}`, projectname).then((res)=>{
            window.location.reload()
        })
    }
   const taskDelete= (id)=>{
    axios.get(`http://localhost:8000/dashboard/taskdelete/${id}`).then(async(res)=>{
      console.log(res)
      await window.location.reload()
   })
  }

  const taskUpdate= (id)=>{
    axios.put(`http://localhost:8000/dashboard/taskupdate/${id}`, projectname).then((res)=>{
      console.log(res)
      window.location.reload()
   })
  }

    return (
        <div className="dash-container">
            <h2 className='task-head'>TASKS</h2>
            <input placeholder='Enter Text' type='text' name="taskname" onChange={taskControl} value={projectname.taskname}/>
            <div className="input-task">
                        <label className="taskname">STATUS</label>
                        <select className="input" name="status" value={projectname.status} onChange={taskControl}>
                            <option name="option" value='todo'>TO DO</option>
                            <option name="option" value='progress'>PROGRESS</option>
                            <option name="option" value='done'>DONE</option>
                        </select>
                    </div>
                    <button className='createtask' type='button' onClick={()=>{createtask(id)}}>create</button>
                <ul className="user-unorder">
                    
                {adminData.map(each=>(
                    <li className="user-list-item" key={each.task_id}>
                    <button className="user-task">{each.task_description}</button>
                    <button className="user-staus">{each.task_status}</button>
                    <button className="user-task-button" onClick={()=>taskUpdate(each.task_id)}>Edit</button>
                    <button className="user-task-button" onClick={()=>taskDelete(each.task_id)}>delete</button>
                </li>
                )
                )}
                </ul>
        </div>
    )
}

export default Task