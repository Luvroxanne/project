import styled from '@emotion/styled';
import { Link, useLocation } from 'react-router-dom';

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

const NavMenu = () => {
  const location = useLocation();

  return (
    <NavContainer>
      <NavSection>
        <NavItem to="/" $active={location.pathname === '/'}>表单设计</NavItem>
        <NavItem to="/import" $active={location.pathname === '/import'}>数据导入</NavItem>
        <NavItem to="/export" $active={location.pathname === '/export'}>数据导出</NavItem>
        <NavItem to="/manage" $active={location.pathname === '/manage'}>数据管理</NavItem>
      </NavSection>
      <NavSection>
        <NavItem to="/distribute" $active={location.pathname === '/distribute'}>表单分发</NavItem>
        <NavItem to="/display" $active={location.pathname === '/display'}>展示页面</NavItem>
      </NavSection>
    </NavContainer>
  );
};

export default NavMenu; 