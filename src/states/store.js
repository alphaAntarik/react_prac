
import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './form_slices'; 
import movieReducer from './movieDataSlice'

export default configureStore({
  reducer: {
    data: dataReducer, 
    movie: movieReducer
  },
});
