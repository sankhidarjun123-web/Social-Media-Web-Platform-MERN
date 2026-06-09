import { useContext, useState, useEffect } from 'react'
import Auth from './layouts/Auth'
import Feed from './layouts/Feed';
import { Navigate, Routes, Route } from 'react-router-dom';

import { AuthContext } from './contexts/AuthContext';
import { ChannelProvider } from './contexts/ChannelContext.jsx'


import './App.css'
import HomePage from './pages/App/HomePage';
import Channel from './layouts/Channel';
import PostPage from './pages/Post/PostPage';
import Network from './pages/App/Network';
import PhotoPage from './pages/Post/PhotoPage';
import PostsSection from './pages/Channel/PostsSection';
import VideosSection from './pages/Channel/VideosSection';
import PhotosSection from './pages/Channel/PhotosSection';
import AboutSection from './pages/Channel/AboutSection';
import FollowersNFollowings from './features/App/FollowersNFollowings';
import Connections from './features/App/Connections';
import Chats from './layouts/Chats.jsx';
import ChatInterface from './features/Chat/ChatInterface.jsx';

// Auth imports
import GetStarted from './pages/App/GetStarted';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import Unauthorized from './pages/Auth/Unauthorized';
import CompleteSignup from './pages/Auth/CompleteSignup';


// Search imports
import SearchPage from './pages/App/SearchPage.jsx';
import SearchAll from './features/Search/SearchAll.jsx';
import SearchPosts from './features/Search/SearchPosts.jsx';
import SearchPeople from './features/Search/SearchPeople.jsx';


import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import PrevSearch from './features/Search/PrevSearches.jsx';

import socket from './socket/socket.js';

function App() {
  const { auth } = useContext(AuthContext);

  useEffect(() => {

    socket.connect();

    return () => {
      socket.disconnect();
    };

  }, []);
  return (
    <>
      <Routes>

        {/* Public Route */}

        <Route element={<PublicRoute />}>
          <Route element={<Auth />}>
            <Route path="/" element={<GetStarted />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<CompleteSignup />} />
            <Route path="/error" element={<Unauthorized />} />
          </Route>
        </Route>

        {/* Protected Route */}

        <Route element={<ProtectedRoute />}>
          <Route element={<Feed />}>
            <Route path="/feed" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />}>
              <Route index element={<PrevSearch />} />
              <Route path="all" element={<SearchAll />} />
              <Route path="posts" element={<SearchPosts />} />
              <Route path="peoples" element={<SearchPeople />} />
            </ Route>
            <Route path="/channel/:channel_Id" element={<Channel />}>
              <Route index element={<PostsSection />} />
              <Route path="posts" element={<PostsSection />} />
              <Route path="about" element={<AboutSection />} />
              <Route path="photos" element={<PhotosSection />} />
              <Route path="videos" element={<VideosSection />} />
            </Route>
            <Route path="/post/:postId" element={<PostPage />} />
            <Route path='/photo' element={<PhotoPage />} />
            <Route path='/network' element={<Network />}>
              <Route path="/network/followersAndFollowings" element={<FollowersNFollowings />} />
              <Route path="/network/connections" element={<Connections />} />
            </Route>

            <Route path="/chats" element={<Chats />}>
              <Route index element={<ChatInterface />} />
              <Route path=":chatId" element={<ChatInterface />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
