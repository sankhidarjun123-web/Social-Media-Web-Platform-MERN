import React from 'react';
import { V } from '../../assets/allImgs';




const SplashScreen = () => {


    return (

        <div className='w-screen h-screen bg-white flex flex-col items-center'>

            <img src={V} alt="logo" className='mt-48 w-[200px] aspect-square'/>

            <div className='w-[200px] h-1 bg-gray-400'>
                <div className='w-[50%] h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 animate-[slide_1s_ease-in-out_infinite]'></div>
            </div>
        </div>
    );
}


export default SplashScreen;