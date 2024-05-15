// src/components/DropboxConnect.js
import React from 'react';
import DropboxChooser from 'react-dropbox-chooser';

const DropboxConnect = ({ onChoose }) => {
    return (
        <div>
            <h1>Connect to Dropbox</h1>
            <DropboxChooser
                appKey="YOUR_DROPBOX_APP_KEY"
                success={(files) => onChoose(files)}
                cancel={() => console.log('Canceled')}
                multiselect={true}
            >
                <button>Choose files</button>
            </DropboxChooser>
        </div>
    );
};

export default DropboxConnect;
