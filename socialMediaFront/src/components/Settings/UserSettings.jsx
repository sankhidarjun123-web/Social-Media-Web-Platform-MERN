import { useState, useEffect, useEffectEvent } from "react";
import { user as userImg, googleImage } from "../../assets/allImgs";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../contexts/ProfileContext";
import DeleteAccount from "./DeleteAccount";
import LocationSetter from "../Profile/LocationSetter";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";
import "react-phone-input-2/lib/style.css";


const UserSettings = () => {
    const { userData, changeOrSetPhone, setUserData, setOrChangePassword, changeUsername, deleteAccount } = useAuth();
    const { editProfile, EPLoad } = useProfile();
    const [setPassword, setSetPassword] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [previousPassword, setPreviousPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [phone, setPhone] = useState(userData?.phone || "");
    const [username, setUsername] = useState(userData?.username || "");
    const [error, setError] = useState("");
    const [isGoogleUser, setIsGoogleUser] = useState(userData?.googleId !== undefined ? true : false);
    const [del, setDel] = useState(false);
    const [delLoading, setDelLoading] = useState(false);
    const [location, setLocation] = useState({
        country: userData?.location?.country || "",
        state: userData?.location?.state || "",
        city: userData?.location?.city || ""
    });

    const [editedProfile, setEditedProfile] = useState({
        location: userData?.location || {
            country: "",
            state: "",
            city: ""
        },
        DOB: userData?.DOB || ""
    });
    const handlePasswordUpdate = async () => {

        if (newPassword.length === 0) return;
        if (userData.hasPassword && previousPassword.length === 0) return;
        try {
            const response = await setOrChangePassword(newPassword, previousPassword || null);
            setSetPassword(false);
            setChangePassword(false);
            setPreviousPassword("");
            setNewPassword("");
            setUserData((prev) => {
                return {
                    ...prev,
                    hasPassword: true
                }
            });
            toast.success("Password changed successfully");
        } catch (err) {
            console.error(err);
            setError("Failed to update password");
        }
    }

    const handleUsernameChange = async () => {

        if (username === userData.username || username.length === 0) return;

        try {
            const response = await changeUsername(username);
            setUserData((prev) => {
                return {
                    ...prev,
                    username: username
                }
            });
            toast.success("Username changed successfully");
        } catch (err) {
            console.error(err);
            setError("Failed to update the username an error occured");
        }
    }


    const handlePhone = async () => {

        if (phone === userData.phone || phone.length === 0) return;

        try {
            const response = await changeOrSetPhone(phone);
            setUserData((prev) => {
                return {
                    ...prev,
                    phone: phone
                }
            });

            toast.success("Phone number changed successfully");
        } catch (err) {
            console.error(err);
            setError("Failed to update the phone an error occured");
        }
    }

    const handleDelete = async (password) => {

        setDelLoading(true);

        try {
            let response;
            
            if(isGoogleUser) response = await deleteAccount(true);

            else response = await deleteAccount(false, password);
            setDel(false);
        } catch (err) {
            console.error(err);
            setError("Failed to delete the account an error occured");
        } finally {
            setDelLoading(false);
        }
    }

    const handleEdit = async () => {

        await editProfile(editedProfile).then(() => toast.success("Edited user profile successfully")).catch((err) => {
            console.error(err);
            setError("Error updating the profile");
    });
    }

    const handlePhoneChange = (value) => {
        if (value === "91") {
            setPhone("");
            return;
        }

        setPhone(`+${value}`);
    };

    useEffect(() => {
        console.log(phone)
    }, [phone]);
    return (
        <div className="w-full h-full flex flex-col gap-6">

            {del && <DeleteAccount
                onDelete={handleDelete}
                del={del} setDel={setDel}
                loading={delLoading}
                isGoogleUser={isGoogleUser}
            />}

            <div className="w-full h-full flex flex-col gap-6">

                {error.length > 0 && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Rest of your settings */}
            </div>

            {/* Username */}
            <label htmlFor="username" className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-slate-700 min-w-[120px]">
                    Username :
                </span>

                <input
                    id="username"
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    className="h-10 px-3 border border-slate-300 rounded-lg"
                />

                <button onClick={handleUsernameChange} disabled={userData?.username === username || username.length === 0} className="cursor-pointer w-20 h-10 border border-slate-300 rounded-lg hover:bg-slate-50">
                    Update
                </button>
            </label>

            {/* Password */}
            <label htmlFor="password" className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-slate-700 min-w-[120px]">
                    Password :
                </span>

                {(userData?.hasPassword || changePassword) && (<>
                    <input
                        id="password"
                        type="password"
                        readOnly={!changePassword}
                        onChange={(e) => setPreviousPassword(e.target.value)}
                        value={userData?.hasPassword && !changePassword ? `********` : previousPassword}
                        placeholder="Previous Password"
                        className="h-10 px-3 border border-slate-300 rounded-lg"
                    />
                </>)}

                {(!changePassword && userData?.hasPassword) && <button onClick={() => setChangePassword(true)} className="cursor-pointer w-20 h-10 border border-slate-300 rounded-lg hover:bg-slate-50">
                    Change
                </button>}

                {(setPassword || changePassword) && <><input
                    type="password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="h-10 px-3 border border-slate-300 rounded-lg"
                />

                    <button onClick={handlePasswordUpdate} className="cursor-pointer w-20 h-10 border border-slate-300 rounded-lg hover:bg-slate-50">
                        Update
                    </button></>}

                {(!setPassword && !userData.hasPassword) && <button onClick={() => setSetPassword(true)} className="cursor-pointer w-16 h-10 border border-slate-300 rounded-lg hover:bg-slate-50">
                    Set
                </button>}

                {isGoogleUser && (
                    <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-sm text-slate-700">
                        <img
                            src={googleImage}
                            alt="Google"
                            className="w-4 h-4"
                        />
                        Google account
                    </span>
                )}
            </label>

            {/* Phone Number */}
            <label htmlFor="phone" className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-slate-700 min-w-[120px]">
                    Phone :
                </span>

                <PhoneInput
                    country={"in"}
                    onlyCountries={["in", "us", "gb", "au", "ca"]}
                    value={phone}
                    placeholder="+91 98765 43210"
                    onChange={handlePhoneChange}
                    containerStyle={{ width: "auto" }}
                    inputStyle={{ width: "250px" }}
                />

                <button onClick={handlePhone} className="cursor-pointer w-20 h-10 border border-slate-300 rounded-lg hover:bg-slate-50">
                    Update
                </button>
            </label>

            {/* Location */}
            <label className="border-t">
                <p className="mt-5 font-medium">Location</p>
                <LocationSetter editedProfile={editedProfile} setEditedProfile={setEditedProfile} location={location} setLocation={setLocation} />
            </label>

            {/* Date of Birth */}
            <label htmlFor="dob" className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-slate-700 min-w-[120px]">
                    Date of Birth :
                </span>

                <input
                    id="dob"
                    type="date"
                    onChange={(e) => setEditedProfile((prev) => {
                        return {
                            ...prev,
                            DOB: e.target.value
                        }
                    })}
                    value={editedProfile.DOB.split("T")[0]}
                    className="cursor-pointer h-10 px-3 border border-slate-300 rounded-lg"
                />
            </label>


            <button onClick={handleEdit} className="cursor-pointer w-20 h-10 border border-slate-300 rounded-lg hover:bg-slate-50">
                Update
            </button>

            {/* Delete Account */}
            <div className="mt-8 border-t pt-6">

                <p className="text-sm text-slate-500 mb-4">
                    Permanently delete your account and all associated data.
                </p>

                <button
                    onClick={() => setDel(true)}
                    className="
                    cursor-pointer
                        px-5
                        py-3
                        rounded-lg
                        border
                        border-slate-300
                        hover:bg-slate-50
                        mb-5
                    "
                >
                    Delete Account
                </button>
            </div>

        </div>
    );
};

export default UserSettings;