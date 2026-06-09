import axios from "axios";



const SERVER = import.meta.env.VITE_SERVER_URL;



const sendConnectionRequest = async(targetId) => {

    const response = await axios.post(`${SERVER}/network/${targetId}/connection/connection_request`, {}, { withCredentials: true })

    return response.data;
}


const acceptConnectionRequest = async(targetId) => {

    const response = await axios.put(`${SERVER}/network/${targetId}/connection/connection_request`, {}, { withCredentials: true });

    return response.data;
}


const rejectConnectionRequest = async(targetId) => {

    const response = await axios.delete(`${SERVER}/network/${targetId}/connection/connection_request`, { withCredentials: true });

    return response.data;
}

const removeConnectionRequest = async(targetId) => {
     const response = await axios.delete(`${SERVER}/network/${targetId}/connection`, { withCredentials: true });

    return response.data;
}


export { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnectionRequest };