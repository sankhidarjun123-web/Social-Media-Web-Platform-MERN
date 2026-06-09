import React from "react";
import { ReactPhotoEditor } from 'react-photo-editor';

const ImageEdit = ({ file, setFile, showModal, setShowModal }) => {

    // Hide modal
    const hideModal = () => {
        setShowModal(false);
    };

    // Save edited image
    const handleSaveImage = (editedFile) => {
        setFile(editedFile);
        // Do something with the edited file
    };

    return (
        <div className="min-w-[600px]">
            <ReactPhotoEditor
                open={showModal}
                onClose={hideModal}
                file={file}
                onSaveImage={handleSaveImage}
            />
        </div>
    )
}