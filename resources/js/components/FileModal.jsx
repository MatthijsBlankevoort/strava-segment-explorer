import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Carousel } from 'react-responsive-carousel';
import styles from 'react-responsive-carousel/lib/styles/carousel.min.css';
import styled from 'styled-components';

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

const FileModal = ({
  modalIsOpen, toggleModal, athlete, segment,
}) => {
  const [file, setFile] = useState();
  const [images, setImages] = useState([]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('file', file[0]);
    fd.append('athleteId', athlete.id);
    fd.append('segmentId', segment.id);
    await axios.post('/api/files', fd).then((res) => {
      const newImages = [...images];
      newImages.push(res.data);
      setImages(newImages);
      console.log(newImages);
    }).catch((err) => console.error(err));
  };

  useEffect(async () => {
    console.log('asdf');
    if (segment.id && athlete.id) {
      await axios.get(`/api/files?athleteId=${athlete.id}&segmentId=${segment.id}`).then((res) => {
        setImages(res.data);
      });
    }
  }, [athlete, segment]);

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => toggleModal(false)}
      appElement={document.getElementById('example')}
      style={customStyles}
    >

      <StyledCarousel showArrows>
        {images.map((image) => (

          <div>
            <img height="200" width="100" className="img-fluid img-thumbnail" src={image.url} alt="" />
          </div>
        ))}

      </StyledCarousel>

      <form>
        <input
          id="myFileInput"
          onChange={(e) => {
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

const StyledCarousel = styled(Carousel)`
    max-width: 80vw;
`;

export default FileModal;
