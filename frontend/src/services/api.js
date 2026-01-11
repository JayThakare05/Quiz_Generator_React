import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const generateQuiz = (formData) =>
  API.post("/quiz/generate", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
