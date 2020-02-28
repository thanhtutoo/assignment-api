import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Teacher } from "../entity/Teacher";
import { Student } from "../entity/Student";
import ResponseFormat from "../core/ResponseFormat";

class TeacherController{

static newRegister = async (req: Request, res: Response) => {

    let studentsPara = req.body.students?req.body.students:0;
    let teacherPara = req.body.teacher?req.body.teacher:0;

    //Validate teacher, and notification (required)
    // if ((!teacher && !studentsPara)) {
    //     return res.status(200).json(ResponseFormat.validation_error(
    //         `Missing Parameter {teacher} or {students_array}`
    //       ));
    // }

    const allStuList: Student[] = [];
    const studentList: Student[] = [];
    
    for (var i = 0; i < studentsPara.length; i++) {
        const studentRepository = getRepository(Student);
        const is_student = await studentRepository.findOne({
            student: studentsPara[i]
        });
        const student = new Student();
        student.student = studentsPara[i];
        // allStuList.push(student);
        if (typeof is_student === 'undefined') {
           
            const newStu = await studentRepository.save(student);   
            studentList.push(newStu);

        } else {
            allStuList.push(is_student);
        }
    }
    const teacherObj = new Teacher();
    teacherObj.teacher = req.body.teacher;
    const unique_stu_list = Array.prototype.concat(...allStuList);
    teacherObj.students = unique_stu_list;
    const teacherRepository = getRepository(Teacher);
    
    try {
        await teacherRepository.save(teacherObj);
    } catch (e) {
        let teacherUpdate = await teacherRepository.findOneOrFail({
            teacher: teacherPara
        });
        const loadedStudent = await getRepository(Teacher)
            .findOne({
                teacher: teacherPara
            }, {
                relations: ["students"]
            });
    
        for (var i = 0; i < Object.keys(loadedStudent.students).length; i++) {
            allStuList.push(loadedStudent.students[i]);
        }

        const unique_stu_list = Array.prototype.concat(...allStuList);
        var allData = [];
        allData = Object.values(unique_stu_list.reduce((acc,cur)=>Object.assign(acc,{[cur.student]:cur}),{}));
        teacherUpdate.students = allData;
        try {
            await teacherRepository.save(teacherUpdate);
        } catch (e) {
            return res.status(409).json(ResponseFormat.error(
                "Teacher already saved!"
              ));        
        }
    }
    return res.status(204).send();
    
};
};

export default TeacherController;
