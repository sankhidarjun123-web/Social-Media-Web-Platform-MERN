import React, { useState, createContext, useContext } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext, useAuth } from "./AuthContext";
import SplashScreen from "../components/ui/SplashScreen";

export const ProfileContext = createContext();     // Profile context for the application

// Provider of profile
export const ProfileProvider = ({ children }) => {

    const navigate = useNavigate();

    const { checkAuth } = useAuth();    // Get user data and setUserData function from AuthContext
    const [loading, setLoading] = useState(false);
    const [EPLoad, setEPLoad] = useState(false);
    const SERVER = import.meta.env.VITE_SERVER_URL;
    const { isProDone, setProDone } = useContext(AuthContext);

    //Function to create a new profile when user first register
    // or if the user profile set-up is incomplete
    const createProfile = async (profileData, setError, isGoogleUser) => {
        setLoading(true);
        try {
            const {
                username,
                firstname,
                lastname,
                DOB,
                bio,
                location,
                websites,
                profileImg,
                coverImg
            } = profileData;

            if (isGoogleUser && !username) {
                setError("Username is required filed");
                setTimeout(() => {
                    setError("");
                }, 3000);
                return;
            } else if (isGoogleUser && username && /\s/.test(username)) {
                setError("Username cannot have spaces");
                setTimeout(() => {
                    setError("");
                }, 3000);
                return;
            }

            if (!firstname) {
                setError("First Name is required filed.");
                return;
            } else if (/\s/.test(firstname)) {
                setError("First Name cannot have leading or trailing spaces");
                setTimeout(() => {
                    setError("");
                }, 3000);
                return;
            }

            if (lastname && /\s/.test(lastname)) {
                setError("Last Name cannot have leading or trailing spaces");
                setTimeout(() => {
                    setError("");
                }, 3000);
                return;
            }

            if (DOB) {
                const { day, month, year } = DOB;
                const anyFilled = day || month || year;
                const allFilled = day && month && year;

                if (anyFilled && !allFilled) {
                    setError("Provide full date of birth.");
                    setTimeout(() => {
                        setError("");
                    }, 3000);
                    return;
                }
            }

            if (location) {
                const { city, state, country } = location;
                const anyFilled = city || state || country;
                const allFilled = city && state && country;

                if (anyFilled && !allFilled) {
                    setError("Provide full location.");

                    setTimeout(() => {
                        setError("");
                    }, 3000);
                    return;
                }
            }
            const formData = new FormData();

            formData.append("username", username);

            formData.append("firstname", firstname);

            if (bio) formData.append("bio", bio);
            if (lastname) formData.append("lastname", lastname);
            if (websites) formData.append("websites", JSON.stringify(websites));

            if (DOB) formData.append("DOB", JSON.stringify(DOB));
            if (location) formData.append("location", JSON.stringify(location));

            if (profileImg) formData.append("profileImg", profileImg);
            if (coverImg) formData.append("coverImg", coverImg);

            await axios.post(
                `${SERVER}/profile/create`,
                formData,
                {
                    withCredentials: true,
                }
            );
            setProDone(true);
            checkAuth();

        } catch (err) {

            if (err.status === 11000) {
                setError("Username provided is already taken!")
                setTimeout(() => {
                    setError("");
                }, 30000);

            }
            console.error(
                "Profile creation failed:",
                err)
        } finally {
            setLoading(false);
        }
    };

    const editProfile = async (editProfileData) => {
        try {
            setEPLoad(true);

            const formData = new FormData();

            // Append normal text fields
            if (editProfileData.firstname)
                formData.append("firstname", editProfileData.firstname);

            if (editProfileData.lastname)
                formData.append("lastname", editProfileData.lastname);

            if (editProfileData.bio)
                formData.append("bio", editProfileData.bio);

            if (editProfileData.location)
                formData.append("location", JSON.stringify(editProfileData.location));

            if (editProfileData.DOB)
                formData.append("DOB", editProfileData.DOB);

            if (editProfileData.websites)
                formData.append("websites", JSON.stringify(editProfileData.websites));

            // Append boolean flags (important: convert to string)
            formData.append("removedProfileImg", String(editProfileData.removedProfileImg));
            formData.append("removedCoverImg", String(editProfileData.removedCoverImg));

            // Append files only if they exist
            if (editProfileData.currentProfileImg instanceof File) {
                formData.append("currentProfileImg", editProfileData.currentProfileImg);
            }

            if (editProfileData.currentCoverImg instanceof File) {
                formData.append("currentCoverImg", editProfileData.currentCoverImg);
            }

            await axios.patch(
                `${SERVER}/profile/edit`,
                formData,
                { withCredentials: true }
            );

            await checkAuth(); // refresh user data

        } catch (err) {
            console.error("Error editing profile:", err);
        } finally {
            setEPLoad(false);
        }
    };

    return (
        <ProfileContext.Provider value={{ createProfile, editProfile, EPLoad }}>
            {loading ? <SplashScreen /> : children}
        </ProfileContext.Provider>
    );
}

export const useProfile = () => {
    return useContext(ProfileContext);
}