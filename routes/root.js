const router = require('express').Router();
router.get('/', (req,res)=>{
    res.json({message:"Welcome to Connect API 😊"});
})
module.exports = router;