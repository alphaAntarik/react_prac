import { createSlice } from '@reduxjs/toolkit'

export const dataSlice = createSlice({
  name: 'data',
  initialState: {
    userId:'',
 
  },
  reducers: {
   
    saveForm1Data: (state, action) => {
      console.log(action.payload);
      
      state.userId=action.payload
    },
  
  },
})

export const { saveForm1Data,  } = dataSlice.actions

export default dataSlice.reducer