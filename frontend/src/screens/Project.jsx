import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";

const Project = ({ navigate }) => {
    const location = useLocation();
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [project, setProject] = useState(location.state.project)

    useEffect(() => {


        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {
            setProject(res.data.project)
        })

        axios.get('/users/all')
            .then(res => setUsers(res.data.users))
            .catch(err => console.log(err));
    }, []);

    // Function to add collaborators
    function addCollaborators() {
        // Ensure projectId exists
        const projectId = location?.state?.project?._id;

        if (!projectId) {
            alert("Project ID is missing.");
            return;
        }

        if (selectedUsers.length === 0) {
            alert("Please select at least one user.");
            return;
        }

        axios.put("/projects/add-user", {
            projectId, // Corrected projectId reference
            users: selectedUsers,
        })
            .then(res => {
                console.log("Users added:", res.data);
                setIsModalOpen(false);  // Close the modal on success
                setSelectedUsers([]);    // Clear selected users
            })
            .catch(err => {
                console.error("Error adding collaborators:", err.response?.data || err.message);
            });
    }


    // Toggle user selection: single click selects, another click unselects
    const handleUserClick = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
        );
    };

    return (
        <main className="h-screen w-screen flex">
            <section className="left flex flex-col h-full min-w-96 relative bg-slate-300">
                <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100">
                    <button onClick={() => setIsModalOpen(true)} className="flex gap-2">
                        <i className="ri-add-fill mr-1"></i>
                        <p>Add collaborators</p>
                    </button>
                    <button
                        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                        className="p-2"
                    >
                        <i className="ri-group-fill"></i>
                    </button>
                </header>
                <div className="conversation-area flex-grow flex flex-col">
                    <div className="message-box p-1 flex flex-grow flex-col gap-1">
                        <div className="incomingMessage max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
                            <small className="opacity-65 tex-xs">example@gmail.com</small>
                            <p className="text-sm">Lorem ipsum dolor sit amet.</p>
                        </div>
                        <div className="ml-auto incomingMessage max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
                            <small className="opacity-65 tex-xs">example@gmail.com</small>
                            <p className="text-sm">Lorem ipsum dolor sit amet.</p>
                        </div>
                    </div>
                    <div className="inputfield w-full flex">
                        <input
                            className="p-2 px-4 border-none outline-none flex-grow"
                            type="text"
                            placeholder="Start Conversation"
                        />
                        <button className="px-5 bg-slate-400">
                            <i className="ri-send-plane-2-fill"></i>
                        </button>
                    </div>
                </div>

                <div
                    className={`sidepanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
                        } top-0`}
                >
                    <header className="flex justify-between items-center p-2 px-3 bg-slate-200">
                    <h1 className="font-semibold text-lg p-2">Collaborators</h1>
                        <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                            <i className="ri-close-fill text-lg"></i>
                        </button>
                        
                    </header>

                    <div className="users flex flex-col gap-2 ">
                        {project.users && project.users.map(user => {
                            return (
                                <div className="user cursor-pointer p-2 hover:bg-slate-200 flex gap-2 items-center">
                                    <div className="aspect-square rounded-full p-2 w-fit h-fit flex items-center text-white justify-center p-5 bg-slate-600">
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className="font-semibold text-lg">{user.email}</h1>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="bg-white p-4 rounded-lg w-full max-w-sm shadow-lg relative max-h-96 overflow-auto flex flex-col">

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-600 hover:text-black"
                        >
                            <i className="ri-close-fill text-xl"></i>
                        </button>

                        <h2 className="text-lg font-semibold mb-3">Select Users</h2>
                        <div
                            className="flex-grow overflow-y-auto flex flex-col gap-2"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            {users.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => handleUserClick(user._id)}
                                    className={`p-2 rounded hover:bg-gray-100 flex items-center gap-3 ${selectedUsers.includes(user._id) ? "bg-slate-200" : ""
                                        }`}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded-full">
                                        <i className="ri-user-fill text-lg"></i>
                                    </div>
                                    {user.email}
                                    {selectedUsers.includes(user._id) && (
                                        <i className="ri-check-fill text-green-600 ml-auto"></i>
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={addCollaborators}
                            className="w-2/3 bg-blue-500 hover:bg-blue-400 text-white p-1 rounded mt-1 flex items-center justify-center gap-2 mx-auto"
                        >
                            <i className="ri-add-fill"></i> Add Collaborators
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Project;
