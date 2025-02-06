import { useState } from 'react';
import Modal from '../components/Modal';

const DataManage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <h1>数据管理页面</h1>
      <button onClick={() => setIsModalOpen(true)}>打开管理弹窗</button>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>数据管理</h2>
        <p>这里是数据管理弹窗内容</p>
      </Modal>
    </div>
  );
};

export default DataManage; 