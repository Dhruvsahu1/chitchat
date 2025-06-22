import {Router} from "express"
const router  = Router();
import * as jarwisController from "../controller/jarwis.controller.js"

router.get('/get-result',jarwisController.getResult)

export default router;