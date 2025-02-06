import styled from '@emotion/styled';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Modal } from 'antd';
import ExcelForm from './ExcelForm';

const NavContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  border-bottom: 2px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
`;

const NavSection = styled.div`
  display: flex;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  padding: 10px 20px;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  color: ${props => props.$active ? '#409EFF' : 'inherit'};

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #409EFF;
    display: ${props => props.$active ? 'block' : 'none'};
  }
`;

const NavButton = styled.div<{ $active?: boolean }>`
  padding: 10px 20px;
  position: relative;
  cursor: pointer;
  color: ${props => props.$active ? '#409EFF' : 'inherit'};
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0 !important;
    width: 800px !important;
    transition: all 0.3s ease;
  }
  
  .ant-modal-body {
    padding: 0;
    height: 700px;
    transition: all 0.3s ease;
  }

  .ant-modal-close {
    display: none;
  }

  &.ant-modal {
    top: 100px;
  }

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    margin: 0;
    padding: 0;

    .ant-modal-content {
      width: 100vw !important;
      height: 100vh !important;
      border-radius: 0;
    }

    .ant-modal-body {
      height: 100vh;
    }
  }
`;

const NavMenu = () => {
  const location = useLocation();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleClose = () => {
    setIsImportModalOpen(false);
    setIsZoomed(false);
  };

  return (
    <>
      <NavContainer>
        <NavSection>
          <NavItem to="/" $active={location.pathname === '/'}>表单设计</NavItem>
          <NavButton 
            onClick={() => setIsImportModalOpen(true)}
            $active={false}
          >
            数据导入
          </NavButton>
          <NavItem to="/export" $active={location.pathname === '/export'}>数据导出</NavItem>
          <NavItem to="/manage" $active={location.pathname === '/manage'}>数据管理</NavItem>
        </NavSection>
        <NavSection>
          <NavItem to="/distribute" $active={location.pathname === '/distribute'}>表单分发</NavItem>
          <NavItem to="/display" $active={location.pathname === '/display'}>展示页面</NavItem>
        </NavSection>
      </NavContainer>

      <StyledModal
        open={isImportModalOpen}
        footer={null}
        width={800}
        destroyOnClose
        onCancel={handleClose}
        className={isZoomed ? 'fullscreen' : ''}
      >
        <ExcelForm 
          isZoomed={isZoomed} 
          onZoomChange={setIsZoomed}
          onClose={handleClose}
        />
      </StyledModal>
    </>
  );
};

export default NavMenu; 