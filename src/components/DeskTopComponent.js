import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { saveForm1Data } from '../states/form_slices';

const DeskTopComponent = () => {
  
  // const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(true); 
const userId = useSelector((state) => state.data.userId);

  // const formData1 = useSelector((state) => state.data.formData1);
  const dispatch = useDispatch()

  
  const navigate = useNavigate();
  useEffect(() => {
    const goToLogin = () => {
      navigate('/login');
    };
    const fetchData = async () => {
      try {
        setLoading(true); 
        const response = await axios.get('http://localhost:3001/user/home',
          {
            headers: {
              Authorization: 'Bearer '+localStorage.getItem('token')
            }
          }
        );
        setLoading(false); 
      
        console.log(JSON.stringify(response,null,2));
        if (!response.data.userId) {

          goToLogin();
          
        } else {
         
           dispatch(saveForm1Data(response.data.userId));
        }
      } catch (err) {
        // handle the error if necessary
         goToLogin();
        setLoading(false); 
      }
    };

    fetchData(); 

  }, [
     dispatch,
   navigate
    ]);  // Add dispatch and navigate to the dependency array


  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h3>Form Data 1</h3>
      <p>UserId: {userId || 'N/A'}</p>

      <br></br>
      <button onClick={()=>{  navigate('/update');}}>Update details</button>
      <br></br>
      <br></br>
      <button onClick={() => {
        localStorage.setItem('token', '')
        navigate('/login')
    }}>Logout</button>
 
      {/* <p>Email: {formData1?.email || 'N/A'}</p>
      <p>Password: {formData1?.password || 'N/A'}</p> */}
    </div>
  );
};

export default DeskTopComponent;
