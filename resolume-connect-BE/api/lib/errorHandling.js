/*
type : info, error, warnig
error : error object or message
response_code : 500, 400
*/
const handleError = function handleError(type, error) {
  console.log(type, error);
  //Winston Log

  //Sentry Report If Error
};

module.exports.handleError = handleError;
