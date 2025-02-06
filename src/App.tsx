import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from '@emotion/styled';
import NavMenu from './components/NavMenu';
import FormDesign from './pages/FormDesign';
import DataExport from './pages/DataExport';
import DataManage from './pages/DataManage';
import FormDistribute from './pages/FormDistribute';
import Display from './pages/Display';

const AppContainer = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <NavMenu />
        <ContentContainer>
          <Routes>
            <Route path="/" element={<FormDesign />} />
            <Route path="/export" element={<DataExport />} />
            <Route path="/manage" element={<DataManage />} />
            <Route path="/distribute" element={<FormDistribute />} />
            <Route path="/display" element={<Display />} />
          </Routes>
        </ContentContainer>
      </AppContainer>
    </Router>
  );
}

export default App; 