import mongoose from "mongoose";

const studentSchema = mongoose.Schema({
    name : String,
    address : String,
    age : Number
});

const Student = mongoose.model("Student",studentSchema);

export default Student;