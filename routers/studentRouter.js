import express from 'express';
import { getAllStudent, saveStudent } from '../controllers/studentControle.js';

const studentRouter = express.Router();

studentRouter.get("/",getAllStudent);
studentRouter.post("/",saveStudent);

export default studentRouter;