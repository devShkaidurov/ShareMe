import React from 'react';
import './modal_styles.css'

const Modal = ({ activeModal, setActiveModal, children }) => {
   return (
    <div className={activeModal ? 'modal active' : 'modal'} onClick={() => setActiveModal(false)}>
        <div className={activeModal ? 'modal_content active' : 'modal_content'} onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
   );
}

export default Modal;