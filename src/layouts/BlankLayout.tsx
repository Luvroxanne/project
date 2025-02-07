import styled from '@emotion/styled';

const BlankContainer = styled.div`
  min-height: 100vh;
  background: #f7f8fa;
`;

const BlankLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BlankContainer>{children}</BlankContainer>;
};

export default BlankLayout; 