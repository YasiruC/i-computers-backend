import Student from "../models/student.js";

export function getAllStudent(req,res){
    Student.find().then(
        (students)=>{
            res.json(students);
        }
    ).catch(
        ()=>{
            res.json({
                 message : "An erroe occurred"
            })
        }
    )
}

export function saveStudent(req,res){
    if(req.user == null){
        res.json({
            message : "Uuauthorized access you need to login before creating student"
        });
        return;
    }else{
        console.log(req.user);
    }

    const student = new Student(req.body);

    student.save().then(
        ()=>{
            res.json({
                message : "Student save successfully"
            })
        }
    ).catch(
        ()=>{
            res.json({
                message : "Student save Failed"
            })
        }
    )
}

