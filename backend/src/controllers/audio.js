

export const audio = (req,res)=>{

res.status(200).json({
    message:"Audio uploaded successfully",
    url:req.file.path ,
    public_id:req.file.filename
})

}