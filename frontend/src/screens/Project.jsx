  import React, { useState, useEffect, useContext } from "react";
  import { useLocation } from "react-router-dom";
  import axios from "../config/axios";
  import {
    initializeSocket,
    sendMessage,
    recieveMessage,
  } from "../config/socket";
  import { UserContext } from "../context/user.context";
  import Markdown from "markdown-to-jsx";
  import { Editor } from "@monaco-editor/react";

  const Project = ({ navigate }) => {
    const location = useLocation();
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [project, setProject] = useState(location.state.project);
    const [message, setMessage] = useState("");
    const { user } = useContext(UserContext);
    const messageBoxRef = React.useRef(null);
    const [messages, setMessages] = useState([]);
    const [fileTree, setFileTree] = useState({
      "app.js": {
        content: `const express = require('express');`,
      },
      "package.json": {
        content: `{"name": "express-server"}`,
      },
    });
    const [currentFile, setCurrentFile] = useState(null);
    const [editorContent, setEditorContent] = useState("");
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [newFilename, setNewFilename] = useState("");

    function getLanguageFromFilename(filename) {
      if (!filename) return "plaintext";
      const lower = filename.toLowerCase();
      if (lower.endsWith(".js") || lower.endsWith(".cjs") || lower.endsWith(".mjs")) return "javascript";
      if (lower.endsWith(".ts")) return "typescript";
      if (lower.endsWith(".json")) return "json";
      if (lower.endsWith(".css")) return "css";
      if (lower.endsWith(".html")) return "html";
      if (lower.endsWith(".md")) return "markdown";
      if (lower.endsWith(".py")) return "python";
      if (lower.endsWith(".java")) return "java";
      return "plaintext";
    }

    useEffect(() => {
      if (currentFile && fileTree[currentFile]) {
        setEditorContent(fileTree[currentFile].content || "");
      }
    }, [currentFile]);

    function handleEditorChange(value) {
      setEditorContent(value ?? "");
      if (!currentFile) return;
      setFileTree(prev => ({
        ...prev,
        [currentFile]: {
          ...(prev[currentFile] || {}),
          content: value ?? "",
        }
      }));
    }

    function handleDownloadCurrentFile() {
      if (!currentFile) return;
      const content = fileTree[currentFile]?.content ?? "";
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentFile;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    function createFile() {
      const trimmed = (newFilename || "").trim();
      if (!trimmed) {
        return;
      }
      if (fileTree.hasOwnProperty(trimmed)) {
        alert("File already exists");
        return;
      }
      setFileTree(prev => ({
        ...prev,
        [trimmed]: { content: "" }
      }));
      setCurrentFile(trimmed);
      setNewFilename("");
      setIsCreatingFile(false);
    }

    useEffect(() => {
      initializeSocket(project._id);

      const handleIncoming = (data) => {
        
        
        if (data.sender._id !== user._id) {
          
          setMessages((prev) => [...prev, data]);
        }
        console.log(JSON.parse(data.message));
      };

      recieveMessage("project-message", handleIncoming);

      axios
        .get(`/projects/get-project/${location.state.project._id}`)
        .then((res) => {
          setProject(res.data.project);
        });

      axios
        .get("/users/all")
        .then((res) => setUsers(res.data.users))
        .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
      if (messageBoxRef.current) {
        messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
      }
    }, [messages]);

    const send = () => {
      if (!message) return;

      const payload = {
        message,
        sender: user,
      };

      setMessages((prev) => [...prev, payload]);
      sendMessage("project-message", payload);
      setMessage("");
    };

    function addCollaborators() {
      const projectId = location?.state?.project?._id;

      if (!projectId) {
        alert("Project ID is missing.");
        return;
      }

      if (selectedUsers.length === 0) {
        alert("Please select at least one user.");
        return;
      }

      axios
        .put("/projects/add-user", {
          projectId,
          users: selectedUsers,
        })
        .then((res) => {
          console.log("Users added:", res.data);
          setIsModalOpen(false);
          setSelectedUsers([]);
        })
        .catch((err) => {
          console.error("Error adding collaborators:", err.response?.data || err.message);
        });
    }

    const handleUserClick = (id) => {
      setSelectedUsers((prev) =>
        prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
      );
    };

    return (
      <main className="h-screen w-screen flex">
        <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
          <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute top-0 z-10">
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

          <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
            <div
              ref={messageBoxRef}
              className="message-box p-1 flex flex-grow flex-col gap-1 overflow-y-auto"
            >
              {messages.map((msg, index) => {
                const isOwn = msg.sender._id === user._id;
                return (
                  <div
                    key={index}
                    className={`max-w-sm flex flex-col p-2 w-fit rounded-md ${
                      isOwn ? "ml-auto bg-slate-100" : "bg-slate-50"
                    }`}
                  >
                    <small className="opacity-65 text-xs">{msg.sender.email}</small>
                    {msg.sender._id === "Jarwis" ? (
                      <div className="text-sm break-words whitespace-pre-wrap overflow-x-auto">
                        <Markdown
                          options={{
                            overrides: {
                              pre: {
                                props: {
                                  className: "bg-gray-200 rounded p-2 text-sm overflow-x-auto",
                                },
                              },
                              code: {
                                props: {
                                  className: "font-mono",
                                },
                              },
                            },
                          }}
                        >
                          {msg.message}
                        </Markdown>
                      </div>
                    ) : (
                      <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="inputfield w-full flex absolute bottom-0">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="p-2 px-4 border-none outline-none flex-grow"
                type="text"
                placeholder="Start Conversation"
              />
              <button onClick={send} className="px-5 bg-slate-400">
                <i className="ri-send-plane-2-fill"></i>
              </button>
            </div>
          </div>

          <div
            className={`sidepanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
              isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
            } top-0`}
          >
            <header className="flex justify-between items-center p-2 px-3 bg-slate-200">
              <h1 className="font-semibold text-lg p-2">Collaborators</h1>
              <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                <i className="ri-close-fill text-lg"></i>
              </button>
            </header>

            <div className="users flex flex-col gap-2">
              {project.users &&
                project.users.map((user) => (
                  <div
                    key={user._id}
                    className="user cursor-pointer p-2 hover:bg-slate-200 flex gap-2 items-center"
                  >
                    <div className="aspect-square rounded-full p-2 w-fit h-fit flex items-center text-white justify-center bg-slate-600">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="right bg-slate-50 flex flex-row h-full w-full overflow-hidden">
          {/* ✅ File Explorer - VSCode-Like */}
          <div className="explorer h-full w-64 bg-white border-r p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-sm font-semibold text-slate-700">Explorer</h2>
              <button
                className="text-xs px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 flex items-center gap-1"
                onClick={() => setIsCreatingFile((v) => !v)}
              >
                <i className="ri-file-add-line"></i>
                New File
              </button>
            </div>
            {isCreatingFile && (
              <div className="mb-2 px-2 flex items-center gap-2">
                <input
                  autoFocus
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createFile();
                    if (e.key === 'Escape') { setIsCreatingFile(false); setNewFilename(""); }
                  }}
                  placeholder="e.g. index.js"
                  className="w-full text-sm px-2 py-1 border rounded outline-none"
                />
                <button
                  className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                  onClick={createFile}
                >
                  Create
                </button>
              </div>
            )}
            <div className="file_tree flex flex-col gap-1">
              {Object.keys(fileTree).map((file) => (
                <button
                  key={file}
                  onClick={() => setCurrentFile(file)}
                  className={`px-3 py-1 rounded text-left text-sm font-medium hover:bg-slate-100 transition-colors duration-150 ${
                    currentFile === file ? "bg-slate-200 font-semibold" : ""
                  }`}
                >
                  <span className="mr-2">
                    <i className="ri-file-code-line" />
                  </span>
                  {file}
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          {currentFile && (
            <div className="code-editor flex flex-col flex-grow h-full bg-white overflow-hidden border-l">
              <div className="code-editor-header flex justify-between items-center px-3 py-2 bg-slate-100 border-b">
                <div className="flex items-center gap-2">
                  <i className="ri-code-s-slash-line text-slate-600" />
                  <h1 className="font-semibold text-sm md:text-base text-slate-800">{currentFile}</h1>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs px-2 py-1 rounded bg-slate-200 hover:bg-slate-300" onClick={handleDownloadCurrentFile}>
                    <i className="ri-download-2-line mr-1" /> Download
                  </button>
                  <button className="p-2 rounded hover:bg-slate-200" onClick={() => setCurrentFile(null)}>
                    <i className="ri-close-fill" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  defaultLanguage={getLanguageFromFilename(currentFile)}
                  language={getLanguageFromFilename(currentFile)}
                  theme="vs-dark"
                  value={editorContent}
                  onChange={handleEditorChange}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    smoothScrolling: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: "on",
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Collaborator Modal */}
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
                    className={`p-2 rounded hover:bg-gray-100 flex items-center gap-3 ${
                      selectedUsers.includes(user._id) ? "bg-slate-200" : ""
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
