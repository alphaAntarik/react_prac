import { createSlice } from '@reduxjs/toolkit'

export const moviesMovieDataSlice = createSlice({
  name: 'movie',
  initialState: {
    movieData:{},
   
  },
  reducers: {
   
    movieReducer: (state, action) => {
      console.log(action.payload);
      
      state.movieData=action.payload
    },
  
  },
})

export const { movieReducer, } = moviesMovieDataSlice.actions

export default moviesMovieDataSlice.reducer