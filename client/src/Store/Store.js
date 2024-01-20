import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Slice/AuthSlice";
import postReducer from "../Slice/PostSlice";
import commentReducer from "../Slice/CommentSlics";
const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
    comment: commentReducer,
  },
});

export default store;
