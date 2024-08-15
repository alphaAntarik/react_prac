
import './App.css';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import DeskTopComponent from './components/DeskTopComponent';
import 'bootstrap/dist/css/bootstrap.min.css'
import {BrowserRouter,Routes, Route} from 'react-router-dom'
import UpdateComponent from './components/UpdateComponent';
function App() {
  return (
    <>
   
        <BrowserRouter>
     <p>This is header</p>
      <Routes>

       
      
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/registration' element={<SignupPage/>} />
          <Route path='*' element='Page not exists' />


        {/* user protected routes- */}
        {/* <Route element={<ProtectedRouteComponent admin={false} />}> */}
  <Route path='/' element={<DeskTopComponent/>} />
  <Route path='/update' element={<UpdateComponent/>} />

          {/* </Route> */}

      </Routes>
      <p>This is footer</p>
    </BrowserRouter>
 

    </>
  );
}

export default App;
