import React,{useState,useContext} from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";

const Register =()=>{
  const [email,setEmail]= useState("");
  const [password,setPassword] = useState("");

  const {setUser} = useContext(UserContext);

  const navigate = useNavigate();
  function submitHandler(e){
    e.preventDefault();
    axios.post("/users/register",{
      email,
      password
    }).then((res)=>{
      console.log(res.data);
      localStorage.setItem('token',res.data.token);
      setUser(res.data.user)
      navigate('/');
    }).catch((err)=>{
      console.log(err.response.data)
    })
  }
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
          <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center">Register</h2>
            
            <form className="space-y-4" onSubmit={submitHandler}>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  onChange={(e)=> setEmail(e.target.value)}
                  type="email"
                  className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input
                  onChange={(e)=> setPassword(e.target.value)}
                  type="password"
                  className="w-full px-4 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
    
              <button
                type="submit"
                className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Create Account
              </button>
            </form>
    
            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      );
    };
    
    export default Register;