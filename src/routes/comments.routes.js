import { Router } from "express";
import { verifyJwt } from "../middlewares/Auth.middleware.js";
import { AddComments,UpdateComments, deleteComments,getAllComments } from "../controllers/comments.controllers.js";

const router=Router();

router.route('/AddComments/:videoId').post(verifyJwt,AddComments)
// router.route().get()
// router.route().Delete()
router.route('/updateComments/:videoId').patch(verifyJwt,UpdateComments)
router.route('/deleteComment/:videoId').delete(verifyJwt,deleteComments)
router.route('/getcomments/:videoId').get(getAllComments)
export default router