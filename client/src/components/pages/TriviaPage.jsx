import React from "react";
import Layout from "../Layout.jsx";
import Trivia from "../modules/Trivia";

const TriviaPage = () => {
  return (
    <Layout currentPage="trivia">
      <h1>Trivia Time!</h1>
      <Trivia />
    </Layout>
  );
};

export default TriviaPage;
