import { useState } from 'react';
import Modal from '../components/Modal';

const DataImport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <h1>数据导入页面</h1>
      <button onClick={() => setIsModalOpen(true)}>打开导入弹窗</button>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>数据导入</h2>
        <p>这里是数据导入弹窗内容</p>
      </Modal>
    </div>
  );
};

export default DataImport; 