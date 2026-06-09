import axios from "axios";
import { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";

// Create the authentication context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const SERVER = import.meta.env.VITE_SERVER_URL;     // Server URL from environment variables

  const [regLoading, setRegLoading] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuth, setAuth] = useState(null);
  const [isProDone, setProDone] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [confirmingMail, setConfirmingMail] = useState(false);

  const [wrongLog, setWrongLog] = useState("");
  const [wrongReg, setWrongReg] = useState("");

  const navigate = useNavigate();

  const [userData, setUserData] = useState({});

  // Function to check if the user is authenticated or not
  const checkAuth = async () => {
    try {

      const res = await axios.get(
        `${SERVER}/auth/status-check`,
        { withCredentials: true }
      );

      const { user } = res.data;

      console.log(res.data);
      setAuth(res.data.authStatus);
      setProDone(res.data.isProfileCompleted);
      setUserData(user);
      return res.data;

    } catch (err) {

      setAuth(false);
      setProDone(false);
      setUserData({});

      return null;

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    checkAuth();

  }, []);

  useEffect(() => {

    const handleVerified = () => {

      console.log(
        "Email verified"
      );

      checkAuth();
    };

    socket.on(
      "registration-successful",
      handleVerified
    );

    return () => {

      socket.off(
        "registration-successful",
        handleVerified
      );
    };

  }, []);

  useEffect(() => {

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online-users");
    };

  }, []);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {

    if (isAuth && userData?._id) {

      const handleConnect = () => {

        console.log(
          "Registering socket user:",
          userData._id
        );

        socket.emit(
          "register-user",
          userData._id
        );
      };

      socket.on(
        "connect",
        handleConnect
      );

      if (socket.connected) {
        handleConnect();
      }

      return () => {
        socket.off(
          "connect",
          handleConnect
        );
      };
    }

  }, [isAuth, userData]);

  // User login
  const login = async (email, password) => {


    if (!email || !password) {
      console.log("The email or password is not provided try again");
      return;
    }

    setLogLoading(true);

    try {
      const response = await axios.post(`${SERVER}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true
      });
      console.log("User successfully logged");

      setConfirmingMail(true);

      setTimeout(() => {
        setConfirmingMail(false);
      }, 3000);
      if (!socket.connected) {

        socket.connect();

        socket.once(
          "connect",
          () => {

            socket.emit(
              "verifying-email",
              email.toLowerCase()
            );
          }
        );

      } else {

        socket.emit(
          "verifying-email",
          email.toLowerCase()
        );
      }

      setConfirmingMail(true);
      setTimeout(() => {
        setConfirmingMail(false);
      }, 3000);
    } catch (err) {
      if ((err.response && err.response.status === 401) || (err.response && err.response.status === 400)) {
        setWrongLog(err?.response?.data?.message);
        setTimeout(() => {
          setWrongLog("");
        }, 3000);
        console.error(err);
        return;
      }
      console.error(err);
      setWrongReg(err?.response?.data?.message);
      setTimeout(() => {
        setWrongReg("");
      }, 3000);
    } finally {
      setLogLoading(false);
    }

  }

  // User register
  const register = async (username, email, password) => {

    if (!username || !email || !password) {
      console.log("The email or password is not provided try again");
      return;
    }

    setRegLoading(true);

    try {
      const response = await axios.post(`${SERVER}/auth/register`, {
        username,
        email,
        password
      }, {
        withCredentials: true
      })
      console.log("User successfully registered");

      if (!socket.connected) {

        socket.connect();

        socket.once(
          "connect",
          () => {

            socket.emit(
              "verifying-email",
              email.toLowerCase()
            );
          }
        );

      } else {

        socket.emit(
          "verifying-email",
          email.toLowerCase()
        );
      }

      setConfirmingMail(true);

      setTimeout(() => {
        setConfirmingMail(false);
      }, 3000);
    } catch (err) {
      if ((err.response && err.response.status === 409) || (err.response && err.response.status === 400)) {
        setWrongReg(err?.response?.data?.message);
        setTimeout(() => {
          setWrongReg("");
        }, 3000);
        console.error(err);
        return;
      }

      console.error(err);
      setWrongReg(err?.response?.data?.message);
      setTimeout(() => {
        setWrongReg("");
      }, 3000);
    } finally {

      setRegLoading(false);
    }
  }

  const logout = async () => {

    await axios.post(
      `${SERVER}/auth/logout`,
      {},
      { withCredentials: true }
    ).then(() => {
      console.log("User successfully logged out");
      checkAuth()     // checking authentication after the logout
      // navigate("/");
    }).catch((err) => {
      console.error(err);
      navigate("/error");
    });
  }


  const setOrChangePassword = async (password, previousPassword = null) => {

    const response = await axios.patch(`${SERVER}/auth/password`, {
      newPassword: password,
      previousPassword
    }, {
      withCredentials: true
    })

    return response;
  }

  const changeUsername = async (newUsername) => {

    const response = await axios.patch(`${SERVER}/auth/change-username`, {
      username: newUsername
    }, {
      withCredentials: true
    });

    return response;
  }


  const changeOrSetPhone = async (phone) => {

    const response = await axios.patch(`${SERVER}/auth/phone`, {
      phone
    }, {
      withCredentials: true
    });

    return response;
  }

  const deleteAccount = async (isGoogleUser, password = null) => {

    const response = await axios.delete(`${SERVER}/auth/delete-account`, {
      data: { 
        password: password,
        isGoogleUser: isGoogleUser
       },
      withCredentials: true
    });

    checkAuth();

    return response;
  }

  const privacySettings = async (privacySettingsData) => {

    const response = await axios.patch(`${SERVER}/auth/privacy-settings`, {
      allowNotifications: privacySettingsData?.allowNotifications,
      allowChats: privacySettingsData?.allowChats,
      allowConnections: privacySettingsData?.allowConnections,

      channelVisibility: (privacySettingsData?.channelVisibility && privacySettingsData?.channelVisibility.length > 0) ?
        privacySettingsData?.channelVisibility : null,

      channelContentVisibility: (privacySettingsData?.channelContentVisibility && privacySettingsData?.channelContentVisibility.length > 0) ?
        privacySettingsData?.channelContentVisibility : null,
    }, {
      withCredentials: true
    });

    return response;
  }

  return (
    <AuthContext.Provider value={{ regLoading, logLoading, confirmingMail, privacySettings, changeOrSetPhone, changeUsername, deleteAccount, setOrChangePassword, login, register, logout, wrongReg, wrongLog, isAuth, isProDone, setProDone, userData, setUserData, loading, checkAuth, onlineUsers }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
}