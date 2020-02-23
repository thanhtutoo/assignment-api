const ResponseFormat = {
        validation_error : (message:string)  => {
            return {
                // data:data,
                message: message,
            }
        },
        error : (message:string) => {
            return {
                message:message
            }
        },        
        success : (data:any) => {
            // data : JSON.stringify(data)
            return data
        }
    }
export default ResponseFormat;
// module.exports = ResponseFormat


