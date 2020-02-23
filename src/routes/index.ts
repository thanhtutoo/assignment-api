import { Router, Request, Response } from "express";

import api from "./api";

const routes = Router();

routes.use("/api", api);
routes.use('*', function(req, res){
    res.status(404).send({message:"Wrong url! Please double check API url!"});
  });
export default routes;
