import React, { useState } from 'react';
import HistoryNav from '../../components/Nav/HistoryNav';
import { Outlet } from 'react-router-dom';



const History = () => {
    const [hnSelected, setHnSelected] = useState("posts");
    return (
        <>
            <HistoryNav hnSelected={hnSelected} setHnSelected={setHnSelected} />
            <main className='w-full mt-16 flex flex-col items-center gap-2'>
                <Outlet />
            </main>
        </>
    );
}


export default History;