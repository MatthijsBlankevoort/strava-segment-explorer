import axios from 'axios';
import React, { useState } from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '999999',
  },
  overlay: { zIndex: 1000 },
};

const FileModal = ({ modalIsOpen, toggleModal }) => {
  const [file, setFile] = useState();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    console.log(file[0]);
    fd.append('file', file[0]);
    console.log(fd);
    await axios.post('/api/files', fd).catch((err) => console.error(err));
  };
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => toggleModal(false)}
      appElement={document.getElementById('example')}
      style={customStyles}
    >

      <form>
        <input
          id="myFileInput"
          onChange={(e) => {
            console.log(e.target.files);
            setFile(e.target.files);
          }}
          type="file"
          accept="image/*;capture=camera"
        />
        <input onClick={(e) => handleSubmit(e)} type="submit" className="btn btn-primary" />
      </form>
    </Modal>
  );
};

export default FileModal;
