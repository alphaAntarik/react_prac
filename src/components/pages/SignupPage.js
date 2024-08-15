// import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// import { saveForm1Data } from '../../states/form_slices';
import { useState } from 'react';
import axios from 'axios';

const SignupPage = () => {
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
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

        const response = await axios.post('http://localhost:3001/user/signup', {
          name:formData.name,
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
        <label>Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Signup</button>
      </form>
    </>
  );
};

export default SignupPage;
