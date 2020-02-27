import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Teacher } from "../entity/Teacher";
import { Student } from "../entity/Student";
import ResponseFormat from "../core/ResponseFormat";

class StudentController{

static getStudentList= async (teacher: any) => {
    var tempData = [];
    const teacherRepository = getRepository(Teacher);
    const teacher_info = await teacherRepository
        .findOne({
            teacher: teacher
        }, {
            relations: ["students"]
        });

    if (typeof teacher_info != "undefined") {
        teacher_info.students.forEach(function(v) {
            tempData.push(v.student);
        });
    }
    return tempData;
}

static retrieveNotification = async (req: Request, res: Response) => {
  //Get the para
  const {teacher,notification} = req.body;
  //Validate teacher, and notification (required)
  if ((!teacher || !notification)) {
    return res.status(200).json(ResponseFormat.validation_error(
        `Missing Parameter {teacher} or {notification}`
      ));
  }
  //Filter emails from notification string
  const regex = /\S+[a-z0-9]@[a-z0-9\.]+/img;
  const student_emails = notification.match(regex);
  
  const stu_email_list = [];
  //If first char is @ then remove
  student_emails.forEach(function(v) {
      if (v[0] === "@") {
        const newstr = v.substring(1);
        stu_email_list.push(newstr);
      }
  });
  //Get students that are mentioned in notification string
  const stu_mentioned_list = []
  for (var i = 0; i < stu_email_list.length; i++) {
      const stu_info = await getRepository(Student).findOne({
          student: stu_email_list[i]
      });
      if (stu_info != undefined && stu_info.is_suspend === false) {
          stu_mentioned_list.push(stu_info.student);
      }
  }
  
  try {
      const all_stu_list = [];
      const tempData = [];
      const data = [];
      const load_teacher = await getRepository(Teacher).createQueryBuilder("teacher")
            .leftJoinAndSelect("teacher.students", "student")
            .where("teacher.teacher_id = :teacher_id", { teacher_id: 1 })
            .andWhere("student.is_suspend = :is_suspend", { is_suspend: 0 })
            .getOne();
      
      const student_list = load_teacher.students;
      for (let i = 0; i < Object.keys(student_list).length; i++) {
          all_stu_list.push(student_list[i]);
      }
  
      all_stu_list.forEach(function(v) {
          tempData.push(v.student);
      });
      data.push(tempData);
      data.push(stu_mentioned_list);
      const allData = Array.prototype.concat(...data);
      const uniqueData = allData.filter((x, i, a) => a.indexOf(x) == i)
      const recipients = {"recipients": uniqueData}
      //Return list of recipients
      return res.status(200).json(ResponseFormat.success(
        recipients
      ));
  } catch (error) {
      //If not found, send a 404 response
      return res.status(404).json(ResponseFormat.error(
        "Teacher could not found!"
      ));
  }
};

static suspendStudent = async (req: Request, res: Response) => {
    //Get the  from the url
    const student = req.body.student;

    //Try to find user on database
    const studentRepository = getRepository(Student);
    let student_info: any;
    try {
        student_info = await studentRepository.findOneOrFail({
            student: student
        });
    } catch (error) {
        //If not found, send a 404 response
        return res.status(404).json(ResponseFormat.error(
            "Student could not found!"
          ));
    }

    student_info.is_suspend = true;
    //Try to safe, if fails, that means students already in use
    try {
        await studentRepository.save(student_info);
        return res.status(204).send();
    } catch (e) {
        return res.status(409).json(ResponseFormat.error(
            "Student already saved!"
          ));
    }
};
static getStudentByteacher = async (req: Request, res: Response) => {
    //Get the teacher from the url
    const teacher_para = decodeURIComponent(req.query.teacher);

    const teacher = teacher_para.split(",");
    var tempData = [];
    try {
        for (var i = 0; i < teacher.length; i++) {
            const stu_list = await StudentController.getStudentList(teacher[i]);
            tempData.push(stu_list);

        }
        if (tempData[0].length > 0 || tempData[1].length > 0) {
            const allData = Array.prototype.concat(...tempData);
            const student_list = {
                "students": allData
            }
            return res.status(200).json(ResponseFormat.success(
                student_list
              ));
        } else {
            return res.status(404).json(ResponseFormat.error(
                "Student could not found!"
              ));
        }

    } catch (error) {
        return res.status(404).json(ResponseFormat.error(
            "Student could not found!"
          ));
    }
};
};

export default StudentController;
