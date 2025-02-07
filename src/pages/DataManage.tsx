import { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { Table, Button, Input, Select, message, Pagination } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, FilterFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { Space } from 'antd';
import EditFormModal from '../components/EditFormModal';

const { Option } = Select;

const PageContainer = styled.div`
  padding: 20px;
  background: #fff;
  min-height: 100vh;
`;

const ToolBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const LeftTools = styled.div`
  display: flex;
  gap: 8px;
`;

const RightTools = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledButton = styled(Button)`
  &.ant-btn-primary {
    background: #00b96b;
  }
`;

const SearchInput = styled(Input)`
  width: 200px;
  transition: all 0.3s;

  &:hover,
  &:focus {
    width: 250px;
  }

  .ant-input-prefix {
    color: #00b96b;
  }

  &.ant-input-affix-wrapper:focus,
  &.ant-input-affix-wrapper-focused {
    border-color: #00b96b;
    box-shadow: 0 0 0 2px rgba(0, 185, 107, 0.1);
  }
`;

const TableFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
`;

const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface FormData {
  id: string;
  formInfo: {
    formName: string;
    formGroup: string;
    createTime: string;
    updateTime: string;
  };
  metadata: {
    totalRows: number;
    importTime: string;
  };
  data: {
    headers: string[];
    rows: any[][];
  };
}

const DataManage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pageSize, setPageSize] = useState<number>(20);
  const [formList, setFormList] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingForm, setEditingForm] = useState<FormData | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFormList();
  }, []);

  const fetchFormList = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:4523/m1/5822023-5507358-default/forms');
      if (response.data.code === 200) {
        setFormList(response.data.data);
      } else {
        message.error('获取表单列表失败');
      }
    } catch (error) {
      console.error('Fetch form list error:', error);
      message.error('获取表单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: FormData) => {
    setEditingForm(record);
  };

  const handleSaveEdit = async (newData: { headers: string[]; rows: any[][] }) => {
    try {
      const response = await axios.put(`http://127.0.0.1:4523/m1/5822023-5507358-default/forms/${editingForm?.id}`, {
        ...editingForm,
        data: newData
      });
      
      if (response.data.code === 200) {
        fetchFormList();
      } else {
        throw new Error('更新失败');
      }
    } catch (error) {
      console.error('Update form error:', error);
      throw error;
    }
  };

  const columns: ColumnsType<FormData> = [
    {
      title: '表单名称',
      dataIndex: ['formInfo', 'formName'],
      key: 'formName',
    },
    {
      title: '分组',
      dataIndex: ['formInfo', 'formGroup'],
      key: 'formGroup',
    },
    {
      title: '数据量',
      dataIndex: ['metadata', 'totalRows'],
      key: 'totalRows',
    },
    {
      title: '创建时间',
      dataIndex: ['formInfo', 'createTime'],
      key: 'createTime',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '更新时间',
      dataIndex: ['formInfo', 'updateTime'],
      key: 'updateTime',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link">删除</Button>
        </Space>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const filteredFormList = useMemo(() => {
    if (!searchText) return formList;
    
    const searchLower = searchText.toLowerCase();
    return formList.filter(form => {
      const formName = form.formInfo.formName.toLowerCase();
      const formGroup = form.formInfo.formGroup.toLowerCase();
      
      return formName.includes(searchLower) || formGroup.includes(searchLower);
    });
  }, [formList, searchText]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredFormList.slice(startIndex, endIndex);
  }, [filteredFormList, currentPage, pageSize]);

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  return (
    <PageContainer>
      <ToolBar>
        <LeftTools>
          <StyledButton type="primary">+ 添加</StyledButton>
          <Button>↓ 导入</Button>
          <Button>↑ 导出</Button>
          <Button>🗑 删除</Button>
          <Button>⟲ 批量操作</Button>
          <Button>⟳ 操作记录</Button>
          <Button>↺ 数据回收站</Button>
        </LeftTools>
        <RightTools>
          <SearchInput 
            placeholder="搜索表单名称或分组" 
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            allowClear
            onPressEnter={(e) => e.preventDefault()}
          />
          <Button icon={<FilterFilled />} />
          <Button>⚙</Button>
          <Button>...</Button>
        </RightTools>
      </ToolBar>

      <Table
        loading={loading}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={paginatedData}
        rowKey="id"
        pagination={false}
      />
      
      <TableFooter>
        <PageSizeSelector>
          <span>每页显示</span>
          <Select 
            value={pageSize} 
            onChange={handlePageSizeChange}
            style={{ width: 100 }}
          >
            <Option value={10}>10 条</Option>
            <Option value={20}>20 条</Option>
            <Option value={50}>50 条</Option>
            <Option value={100}>100 条</Option>
          </Select>
        </PageSizeSelector>

        <Pagination
          current={currentPage}
          total={filteredFormList.length}
          pageSize={pageSize}
          showQuickJumper
          showTotal={(total) => `共 ${total} 条`}
          onChange={handlePageChange}
          onShowSizeChange={(current, size) => handlePageSizeChange(size)}
        />
      </TableFooter>

      {editingForm && (
        <EditFormModal
          visible={!!editingForm}
          onClose={() => setEditingForm(null)}
          formData={editingForm.data}
          onSave={handleSaveEdit}
        />
      )}
    </PageContainer>
  );
};

export default DataManage; 