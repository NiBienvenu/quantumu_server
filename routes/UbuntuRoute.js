const UbuntuController = require("../Controller/UbuntuControler");

const router = require("express").Router();

router.post("/addubuntu", UbuntuController.addUbuntu);
router.get("/findAllUbuntu", UbuntuController.FindAllUbuntu);
router.get("/showOneUbuntu/:id", UbuntuController.ShowOneUbuntu);
router.put("/updateUbuntu/:id", UbuntuController.UpdateUbuntu);
router.delete("/deleteUbuntu/:id", UbuntuController.DeleteUbuntu);





module.exports = router;
