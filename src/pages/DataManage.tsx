import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Table, Button, Input, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, FilterFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Space } from 'antd';

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
}

const DataManage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pageSize, setPageSize] = useState<number>(20);
  const [formList, setFormList] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 从本地存储获取表单数据
    const loadForms = () => {
        try {
            const forms = JSON.parse(localStorage.getItem('forms') || '[]');
            setFormList(forms);
        } catch (error) {
            console.error('Load forms error:', error);
            message.error('加载表单列表失败');
        }
    };

    loadForms();
  }, []);

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
          <Button type="link">编辑</Button>
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
            placeholder="搜索表单" 
            prefix={<SearchOutlined />} 
          />
          <Select defaultValue="20" style={{ width: 120 }}>
            <Option value="20">20 条/页</Option>
            <Option value="50">50 条/页</Option>
            <Option value="100">100 条/页</Option>
          </Select>
          <Button icon={<FilterFilled />} />
          <Button>⚙</Button>
          <Button>...</Button>
        </RightTools>
      </ToolBar>

      <Table
        loading={loading}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={formList}
        pagination={{
          total: formList.length,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </PageContainer>
  );
};

export default DataManage; 