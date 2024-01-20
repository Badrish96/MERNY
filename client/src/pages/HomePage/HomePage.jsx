import React from "react";
import Posts from "../../components/Posts/Posts";
import Post from "../../components/Post/Post";
import Recommendations from "../../components/Recommendations/Recommendations";
import Navbar from "../../components/Navbar/Navbar";
export default function HomePage() {
  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-8">
            <Posts />
            <Post />
          </div>
          <div className="col-4">
            <Recommendations />
          </div>
        </div>
      </div>
    </div>
  );
}
