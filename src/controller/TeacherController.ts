import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Teacher } from "../entity/Teacher";
import { Student } from "../entity/Student";
import ResponseFormat from "../core/ResponseFormat";

class TeacherController{

static newRegister = async (req: Request, res: Response) => {

    let students_array = req.body.students?req.body.students:0;
    let teacher = req.body.teacher?req.body.teacher:0;

    //Validate teacher, and notification (required)
    if ((!teacher && !students_array)) {
        return res.status(200).json(ResponseFormat.validation_error(
            `Missing Parameter {teacher} or {students_array}`
          ));
    }

    const all_stu_list: Student[] = [];
    const student_list: Student[] = [];
    
    for (var i = 0; i < students_array.length; i++) {
        const studentRepository = getRepository(Student);
        const is_student = await studentRepository.findOne({
            student: students_array[i]
        });
        const student = new Student();
        student.student = students_array[i];
        all_stu_list.push(student);
        if (typeof is_student === 'undefined') {
            student_list.push(student);
            await studentRepository.save(student);
        } else {
            all_stu_list.push(is_student);
        }
    }
    
    const teacherObj = new Teacher();
    teacherObj.teacher = req.body.teacher;
    const unique_stu_list = Array.prototype.concat(...all_stu_list);
    teacherObj.students = unique_stu_list;
    const teacherRepository = getRepository(Teacher);
    
    try {
        await teacherRepository.save(teacherObj);
    } catch (e) {
        let teacher_update = await teacherRepository.findOneOrFail({
            teacher: teacher
        });
        const loaded_student = await getRepository(Teacher)
            .findOne({
                teacher: teacher
            }, {
                relations: ["students"]
            });
    
        for (var i = 0; i < Object.keys(loaded_student.students).length; i++) {
            all_stu_list.push(loaded_student.students[i]);
        }
        teacher_update.students = unique_stu_list;
        try {
            await teacherRepository.save(teacher_update);
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
