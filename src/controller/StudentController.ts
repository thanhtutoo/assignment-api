import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Teacher } from "../entity/Teacher";
import { Student } from "../entity/Student";
import ResponseFormat from "../core/ResponseFormat";

class StudentController{

static getStudentList= async (teacher: any) => {
    var tempData = [];
    const teacherRepository = getRepository(Teacher);
    const teacherInfo = await teacherRepository
        .findOne({
            teacher: teacher
        }, {
            relations: ["students"]
        });

    if (typeof teacherInfo != "undefined") {
        teacherInfo.students.forEach(function(v) {
            tempData.push(v.student);
        });
    }
    return tempData;
}

static retrieveNotification = async (req: Request, res: Response) => {
  //Get the para
  const teacherPara = req.body.teacher;
  const notificationPara = req.body.notification;

  //Filter emails from notification string
  const regex = /\S+[a-z0-9]@[a-z0-9\.]+/img;
  const studentEmails = notificationPara.match(regex);
  
  const stuEmailList = [];
  //If first char is @ then remove
  studentEmails.forEach(function(v:string) {
      if (v[0] === "@") {
        const newstr = v.substring(1);
        stuEmailList.push(newstr);
      }
  });
  //Get students that are mentioned in notification string
  const stuMentionedList = []
  for (var i = 0; i < stuEmailList.length; i++) {
      const stuInfo = await getRepository(Student).findOne({
          student: stuEmailList[i]
      });
      if (stuInfo != undefined && stuInfo.is_suspend === false) {
        stuMentionedList.push(stuInfo.student);
      }
  }
  
  try {
      const allStuList = [];
      const tempData = [];
      const data = [];
      const loadTeacher = await getRepository(Teacher).createQueryBuilder("teacher")
            .leftJoinAndSelect("teacher.students", "student")
            .where("teacher.teacher = :teacher", { teacher: teacherPara })
            .andWhere("student.is_suspend = :is_suspend", { is_suspend: 0 })
            .getOne();
      
      const student_list = loadTeacher.students;
      for (let i = 0; i < Object.keys(student_list).length; i++) {
        allStuList.push(student_list[i]);
      }
  
      allStuList.forEach(function(v) {
          tempData.push(v.student);
      });
      data.push(tempData);
      data.push(stuMentionedList);
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
    const studentPara = req.body.student;
    //Try to find user on database
    const studentRepository = getRepository(Student);
    let studentInfo: any;
    try {
        studentInfo = await studentRepository.findOneOrFail({
            student: studentPara
        });
    } catch (error) {
        //If not found, send a 404 response
        return res.status(404).json(ResponseFormat.error(
            "Student could not found!"
          ));
    }

    studentInfo.is_suspend = true;
    //Try to safe, if fails, that means students already in use
    try {
        await studentRepository.save(studentInfo);
        return res.status(204).send();
    } catch (e) {
        return res.status(409).json(ResponseFormat.error(
            "Student already saved!"
          ));
    }
};
static getStudentByteacher = async (req: Request, res: Response) => {
    //Get the teacher from the url
    const teacherPara = decodeURIComponent(req.query.teacher);

    const teacher = teacherPara.split(",");
    var tempData = [];
    // var commonData = [];
    try {
        for (var i = 0; i < teacher.length; i++) {
            const stuList = await StudentController.getStudentList(teacher[i]);
            tempData.push(stuList);

        }
        if(teacher.length > 1){
            console.log(tempData);
            if (tempData.length > 0) {
                const allData = Array.prototype.concat(...tempData);
               
                const commonData = tempData.reduce((a, b) => a.filter(c=> b.includes(c)));
    
                const studentList = {
                    "students": commonData
                }
                return res.status(200).json(ResponseFormat.success(
                    studentList
                  ));
            } else {
                return res.status(404).json(ResponseFormat.error(
                    "Student could not found!"
                  ));
            }
        }else{
            const studentList = {
                "students": tempData
            }
            return res.status(200).json(ResponseFormat.success(
                studentList
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
