import { Router } from "express";
import TeacherController from "../controller/TeacherController";
import StudentController from "../controller/StudentController";
import { registerValidationRules,teacherValidationRules, studentValidationRules, notificationValidationRules, validate} from "../core/Validator";

  const router = Router();

  //Task 1, register new students base on teacher
  router.post("/register",registerValidationRules(), validate, TeacherController.newRegister);
  //Task 2, retrieve students base on teacher
  router.get("/commonstudents", teacherValidationRules(), validate, StudentController.getStudentByteacher);
  //Task3, suspend student
  router.post("/suspend",studentValidationRules(), validate, StudentController.suspendStudent);
  //Task4,  retrieve stu to send noti
  router.post("/retrievefornotifications",notificationValidationRules(), validate, StudentController.retrieveNotification);

  export default router;