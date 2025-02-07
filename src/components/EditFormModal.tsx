import React, { useState } from 'react';
import { Modal, Table, Input, Button, message } from 'antd';
import styled from '@emotion/styled';
import type { ColumnsType } from 'antd/es/table';
import { FullscreenOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface EditFormModalProps {
  visible: boolean;
  onClose: () => void;
  formData: {
    headers: string[];
    rows: any[][];
  };
  onSave: (newData: { headers: string[]; rows: any[][] }) => Promise<void>;
}

const StyledModal = styled(Modal)`
  &.fullscreen-modal {
    width: 100vw !important;
    max-width: 100vw;
    height: 100vh;
    top: 0;
    padding: 0;
    
    .ant-modal-content {
      height: 100vh;
      border-radius: 0;
      display: flex;
      flex-direction: column;
    }
    
    .ant-modal-body {
      flex: 1;
      padding: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
`;

const ToolBar = styled.div`
  padding: 12px 24px;
  background: #f7f8fa;
  border-bottom: 1px solid #dee0e3;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ToolBarLeft = styled.div`
  display: flex;
  gap: 8px;
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  padding: 0 24px;
  
  .ant-table-wrapper {
    height: 100%;
    .ant-table {
      height: 100%;
    }
  }
  
  .ant-table-cell {
    padding: 4px 8px !important;
    
    &.editing {
      padding: 0 !important;
    }
  }
  
  .editable-cell {
    cursor: pointer;
    &:hover {
      background: #f5f5f5;
    }
  }
  
  .ant-input {
    border-radius: 0;
    border: 1px solid #1890ff;
  }
`;

const HeaderCell = styled.div`
  padding: 4px 8px;
  background: #fafafa;
  border-bottom: 2px solid #dee0e3;
  font-weight: 500;
`;

const EditFormModal: React.FC<EditFormModalProps> = ({
  visible,
  onClose,
  formData,
  onSave
}) => {
  const [editingData, setEditingData] = useState(formData);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);

  const columns: ColumnsType<any> = [
    {
      title: '#',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1
    },
    ...editingData.headers.map((header, index) => ({
      title: (
        <HeaderCell>
          <Input
            value={header}
            onChange={(e) => handleHeaderChange(index, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            bordered={false}
          />
        </HeaderCell>
      ),
      dataIndex: index.toString(),
      key: index.toString(),
      width: 150,
      render: (text: string, _, rowIndex: number) => {
        const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colIndex === index;
        return isEditing ? (
          <Input
            value={text}
            onChange={(e) => handleCellChange(rowIndex, index, e.target.value)}
            autoFocus
            onBlur={() => setEditingCell(null)}
            onPressEnter={() => setEditingCell(null)}
          />
        ) : (
          <div
            className="editable-cell"
            onClick={() => setEditingCell({ rowIndex, colIndex: index })}
          >
            {text}
          </div>
        );
      }
    })),
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, __, index) => (
        <Button 
          type="text" 
          icon={<DeleteOutlined />} 
          onClick={() => handleDeleteRow(index)}
        />
      )
    }
  ];

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...editingData.headers];
    newHeaders[index] = value;
    setEditingData({ ...editingData, headers: newHeaders });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...editingData.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    setEditingData({ ...editingData, rows: newRows });
  };

  const handleAddRow = () => {
    const newRow = new Array(editingData.headers.length).fill('');
    setEditingData({
      ...editingData,
      rows: [...editingData.rows, newRow]
    });
  };

  const handleDeleteRow = (index: number) => {
    const newRows = editingData.rows.filter((_, i) => i !== index);
    setEditingData({ ...editingData, rows: newRows });
  };

  const handleSave = async () => {
    try {
      await onSave(editingData);
      message.success('保存成功');
      onClose();
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
    <StyledModal
      title="编辑表单数据"
      open={visible}
      onCancel={onClose}
      width="100%"
      className="fullscreen-modal"
      footer={null}
      destroyOnClose
    >
      <ToolBar>
        <ToolBarLeft>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddRow}
          >
            添加行
          </Button>
        </ToolBarLeft>
        <div>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      </ToolBar>
      <TableContainer>
        <Table
          columns={columns}
          dataSource={editingData.rows.map((row, index) => ({
            key: index,
            ...row.reduce((acc, cell, i) => ({ ...acc, [i]: cell }), {})
          }))}
          pagination={false}
          scroll={{ x: 'max-content', y: 'calc(100vh - 180px)' }}
          bordered
          size="middle"
        />
      </TableContainer>
    </StyledModal>
  );
};

export default EditFormModal; 