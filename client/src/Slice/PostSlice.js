import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
  loading: false,
  error: null,
};

const PostSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    createPostStart(state) {
      state.loading = true;
      state.error = null;
    },
    createPostSuccess(state, action) {
      state.loading = false;
      state.posts.push(action.payload); // Assuming the new post is in the payload
      state.error = null;
    },
    createPostFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { createPostStart, createPostSuccess, createPostFailure } =
  PostSlice.actions;
export const selectPosts = (state) => state.post.posts;
export default PostSlice.reducer;
