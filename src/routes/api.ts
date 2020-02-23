import { Router } from "express";
import TeacherController from "../controller/TeacherController";
import StudentController from "../controller/StudentController";

  const router = Router();

  //Task 1, register new students base on teacher
  router.post("/register", TeacherController.newRegister);
  //Task 2, retrieve students base on teacher
  router.get("/commonstudents", StudentController.getStudentByteacher);
  //Task3, suspend student
  router.post("/suspend", StudentController.suspendStudent);
  //Task4,  retrieve stu to send noti
  router.post("/retrievefornotifications", StudentController.retrieveNotification);

  export default router;