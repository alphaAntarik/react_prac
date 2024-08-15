
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const LoginPage = () => {

 const navigate = useNavigate();
  // const dispatch = useDispatch();

  const [formData, setFormData] = useState({
   
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const goToHome = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
   
    try {
      setIsLoading(true);

        const response = await axios.post('http://localhost:3001/user/login', {
        
          email:formData.email,
          password:formData.password,
      });

      const result = response.data;  
      console.log('Server response:', result);

      if (result.token) {
        // dispatch(saveForm1Data(result.token));
        localStorage.setItem('token',result.token)
        goToHome();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

       return (
        <>
      <form onSubmit={handleSubmit}>
       
        <label>Email:</label>
        <input
          type="email"
          id='email'
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          name="password"
          id='password'
          value={formData.password}
          onChange={handleChange}
         
          required
        ></input>

        <button type="submit">Login</button>
           </form>
           
<br></br>
<br></br>
           <button onClick={()=>{navigate('/registration');}}>Signup</button>
    </>
  
    );
}

export default LoginPage