import { Router } from "express"
import { registeruser,
    loginUser,
    logoutuser,
    refreshAccessToken,
    ChangeCurrentPassword,
    getCurrentUser,
    UpdateAccoutDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getwatchHistory,
 } from "../controllers/User.controllers.js"
import { verifyJwt } from "../middlewares/Auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { publishVideo,getVideoById,updatethumbnail,DeleteVideo,PublishStatus, getAllvideo } from "../controllers/Video.controllers.js"
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"coverImage",
            maxCount:1,
            
        },
        {
            name:"avatar",
            maxCount:1
        },
    ]),
   
    registeruser)

router.route("/login").post(loginUser)

//secured Routes


router.route("/logout").post(verifyJwt,logoutuser)

router.route("/refreshtoken").post(refreshAccessToken)

router.route("/resetpassword").post(verifyJwt,ChangeCurrentPassword)

router.route("/currentuser").get(verifyJwt,getCurrentUser)

router.route("/updateAccount").patch(verifyJwt,UpdateAccoutDetails)

router.route("/updateAvatar").patch(verifyJwt,upload.single("avatar"),updateUserAvatar)

router.route("/updateCoverImage").patch(verifyJwt,upload.single("coverImage"),updateCoverImage )

router.route("/c/:username").get(verifyJwt,getUserChannelProfile)

router.route("/history").get(verifyJwt,getwatchHistory)

router.route("/getAll").get(getAllvideo)

router.route("/createVideo").post(upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), publishVideo)

router.route("/getVideo/:videoId").get(getVideoById)



router.route("/updatedetails/:videoId").patch(upload.single("thumbnail"),updatethumbnail)


router.route("/DeleteVideo/:videoId").delete(DeleteVideo)

router.route("/ToggleVideo/:videoId").get(PublishStatus)

export default router
