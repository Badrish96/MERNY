import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  comments: [],
  loading: false,
  error: null,
};

const CommentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    createCommentStart(state) {
      state.loading = true;
      state.error = null;
    },
    createCommentSuccess(state, action) {
      state.loading = false;
      state.comments.push(action.payload);
      state.error = null;
    },
    createCommentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createCommentStart,
  createCommentSuccess,
  createCommentFailure,
} = CommentSlice.actions;
export const selectComments = (state) => state.comment.comments;
export default CommentSlice.reducer;
