
import { useEffect, useState } from 'react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

const UpdateComponent = () => {
     
 const navigate = useNavigate();
    const [formData, setFormData] = useState({
    name: '',
  
  });
const [isloading, setLoading]=useState(false)

    
  useEffect(() => {
   
    const fetchData = async () => {
      try {
        setLoading(true); 
        const response = await axios.get('http://localhost:3001/user/getUserData',
          {
            headers: {
              Authorization: 'Bearer '+localStorage.getItem('token')
            }
          }
        );
        setLoading(false); 
      
        console.log(JSON.stringify(response,null,2));
        if (!response.data.name) {

         navigate('/login');
          
        } else {
         
          setFormData({name:response.data.name})
            // localStorage.setItem('token',response.data.token)
     
        }
      } catch (err) {
        // handle the error if necessary
         navigate('/login');
        setLoading(false); 
      }
    };

    fetchData(); 

  }, [
    // dispatch,
   navigate
    ]); 
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
   update()
   
  };



const update = async () => {
  try {
    setLoading(true);

    const response = await axios.post(
      'http://localhost:3001/user/update',
      { name: formData.name }, // Ensure `name` is included here
      {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }
    );

    const result = response.data;
    console.log('Server response:', result);

    if (!result.name) {
      setLoading(false);
      
      navigate('/login');
    } else {
      localStorage.setItem('token',result.token)
      navigate('/');
    }

  } catch (error) {
    console.error('Error:', error);
    setLoading(false);
  }
};

  if (isloading) {
    return <p>Loading</p>
  }

    return (
        <>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          id='name'
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

      

        <button type="submit">Submit</button>
      </form>
    </>
  
    );
}

export default UpdateComponent;
