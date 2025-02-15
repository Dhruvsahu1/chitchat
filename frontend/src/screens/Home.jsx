import React, { useContext, useState ,useEffect} from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { user } = useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [project,setproject] = useState([]);
    const navigate = useNavigate();

    function createProject(e) {
        e.preventDefault();
        console.log("Project Created:", projectName);
        // Close modal after submission

        axios.post("/projects/create",{
            name:projectName,
        }).then((res)=>{
            console.log(res);
            setIsModalOpen(false);
        }).catch((err)=>{
            console.log(err);
        })
    }

    useEffect(()=>{
        axios.get('/projects/all').then((res)=>{
           
            setproject(res.data.projects)
        }).catch(err=>{
            console.log(err)
        })
    },[])

    return (
        <main className="p-4">
            <div className="projects flex flex-wrap gap-3">
                {/* Button to open modal */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-4 border border-slate-300 rounded-md text-white bg-gray-800 hover:bg-gray-600 transition flex items-center"
                >
                    <i className="ri-add-circle-line text-lg mr-2"></i> Create Project
                </button>

                {
                    project.map((project)=>(
                        <div key={project._id}
                         onClick={()=> {navigate(`/project`,{
                            state:{project}
                         })}}
                         className="project flex flex-col gap-2 cursor-pointer p-4 border border-slate-300 rounded-md min-w-44 hover:bg-slate-200">
                            <h2 className="font-semibold">
                                {project.name}
                            </h2>
                            <div className="flex gap-2">
                            <p><small><i className="ri-user-3-line"></i> </small><small>Collaborators</small> :</p>
                                {project.users.length}
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold text-white mb-4">Enter Project Name</h2>

                        <form onSubmit={createProject} className="space-y-4">
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Project Name"
                                required
                            />

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Home;
