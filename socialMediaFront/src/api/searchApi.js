import axios from "axios";

const SERVER = import.meta.env.VITE_SERVER_URL;


const getSearchResults = async (keywords, limit = 10, skip = 0, get = "all") => {


    const response = await axios.get(`${SERVER}/search/keyword?keywords=${encodeURIComponent(keywords)}&limit=${limit}&skip=${skip}&get=${get}`,
        {
            withCredentials: true
        });

    return response.data;
};


const getSearchRelated = async (input) => {

    const response = await axios.post(`${SERVER}/search/input`, {
        input
    }, {
        withCredentials: true
    });

    return response.data;
}


const addSearchedUsers = async (requestedUserId) => {

    try {
        const response = await axios.patch(`${SERVER}/search/searchedUsers/${requestedUserId}`, {}, { withCredentials: true });
        console.log(response);
        return response.data;
    } catch (err) {
        console.error(err);
        return null;
    }
}


export { getSearchRelated, getSearchResults, addSearchedUsers };